import type { BlockContractBase } from "@cogent/contracts";
import { enrichResultWithHints } from "./hintMatchers.js";
import type { ContractTestCase, GradingResult, TestCaseResult } from "./types.js";

export function extractFunctionName(stub: string): string {
  const match = stub.match(/function\s+(\w+)\s*\(/);
  if (!match?.[1]) {
    throw new Error("Could not determine function name from contract stub.");
  }
  return match[1];
}

/** Strip simple TS annotations so learner stubs run in the browser/Function constructor. */
export function toRunnableJs(code: string): string {
  return (
    code
      .replace(/^\s*export\s+/gm, "")
      // Object return types (incl. multiline) — before bare :boolean/:string strips
      .replace(/\)\s*:\s*\{[\s\S]*?\}\s*(?=\{)/g, ") ")
      .replace(/\)\s*:\s*\{[^{}]+\}/g, ")")
      .replace(/:\s*number\b/g, "")
      .replace(/:\s*boolean\b/g, "")
      .replace(/:\s*string\b/g, "")
      .replace(/:\s*Record<string,\s*string>/g, "")
      .replace(/:\s*void\b/g, "")
      .replace(/:\s*JSX\.Element\b/g, "")
      .replace(/:\s*\[T,\s*\([^)]*\)\s*=>\s*void\]/g, "")
      .replace(/<[A-Z]\w*>/g, "")
      .replace(/<T>/g, "")
  );
}

export function invokeBlockFunction(
  userCode: string,
  fnName: string,
  input: Record<string, unknown>,
): unknown {
  const js = toRunnableJs(userCode);
  const argNames = Object.keys(input);
  const argValues = Object.values(input);

  const runner = new Function(
    ...argNames,
    `"use strict";\n${js}\nreturn ${fnName}(${argNames.join(", ")});`,
  );

  return runner(...argValues);
}

/** Prepare learner block code as an ES module export for Sandpack assembly. */
export function exportBlockCode(userCode: string, stub: string): string {
  const fnName = extractFunctionName(stub);
  let js = toRunnableJs(userCode);
  if (!/\bexport\s+function/.test(js)) {
    js = js.replace(`function ${fnName}`, `export function ${fnName}`);
  }
  return js;
}

function matchesExpected(received: unknown, testCase: ContractTestCase): boolean {
  if (testCase.match === "validator_shape") {
    return (
      typeof received === "object" &&
      received !== null &&
      typeof (received as { valid?: unknown }).valid === "boolean" &&
      typeof (received as { message?: unknown }).message === "string"
    );
  }

  if (testCase.match === "partial") {
    if (typeof testCase.expected !== "object" || testCase.expected === null) {
      return Object.is(received, testCase.expected);
    }
    if (typeof received !== "object" || received === null) {
      return false;
    }
    return Object.entries(testCase.expected as Record<string, unknown>).every(
      ([key, value]) => (received as Record<string, unknown>)[key] === value,
    );
  }

  if (typeof received === "object" && received !== null) {
    return JSON.stringify(received) === JSON.stringify(testCase.expected);
  }

  return Object.is(received, testCase.expected);
}

function runSingleTest(
  contract: BlockContractBase,
  userCode: string,
  testCase: ContractTestCase,
): TestCaseResult {
  const fnName = extractFunctionName(contract.stub);

  try {
    const received = invokeBlockFunction(userCode, fnName, testCase.input);
    const pass = matchesExpected(received, testCase);

    const base: TestCaseResult = {
      name: testCase.name,
      pass,
      expected: testCase.expected,
      received,
    };

    return enrichResultWithHints(userCode, testCase, base);
  } catch (error) {
    const base: TestCaseResult = {
      name: testCase.name,
      pass: false,
      expected: testCase.expected,
      received: undefined,
      error: error instanceof Error ? error.message : String(error),
    };
    return enrichResultWithHints(userCode, testCase, base);
  }
}

export function runContractTests(
  contract: BlockContractBase,
  userCode: string,
  testCases: ContractTestCase[],
): GradingResult {
  const results = testCases.map((testCase) =>
    runSingleTest(contract, userCode, testCase),
  );

  const hints = results
    .filter((result) => !result.pass && result.hint)
    .map((result) => result.hint as string);

  return {
    pass: results.every((result) => result.pass),
    results,
    hints,
  };
}
