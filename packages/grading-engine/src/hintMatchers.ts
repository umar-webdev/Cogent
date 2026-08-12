import type { ContractTestCase, TestCaseResult } from "./types.js";

const ALWAYS_FALSE_HINT =
  "Your function always returns false. Check the condition before returning.";

const ASSIGNMENT_INSTEAD_OF_COMPARE_HINT =
  "Did you use = instead of === or %? Assignment inside a condition often causes bugs.";

export function enrichResultWithHints(
  userCode: string,
  testCase: ContractTestCase,
  result: TestCaseResult,
): TestCaseResult {
  if (result.pass) return result;

  const hints: string[] = [];
  if (testCase.hint) hints.push(testCase.hint);

  if (userCode.includes("return false") && !userCode.includes("if")) {
    hints.push(ALWAYS_FALSE_HINT);
  }

  if (/if\s*\([^=]*=[^=]/.test(userCode)) {
    hints.push(ASSIGNMENT_INSTEAD_OF_COMPARE_HINT);
  }

  if (result.error) {
    hints.push(`Runtime error: ${result.error}`);
  }

  return {
    ...result,
    hint: hints.join(" "),
  };
}
