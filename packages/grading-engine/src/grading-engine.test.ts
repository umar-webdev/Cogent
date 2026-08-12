import { describe, expect, test } from "bun:test";
import { conditionalContract } from "@cogent/contracts";
import { runContractTests, toRunnableJs } from "./index.js";

const sampleTests = [
  { name: "4 is even", input: { value: 4 }, expected: true },
  { name: "3 is odd", input: { value: 3 }, expected: false },
];

describe("grading-engine", () => {
  test("toRunnableJs strips type annotations", () => {
    const js = toRunnableJs("function checkValue(value: number): boolean { return true; }");
    expect(js).not.toContain(": number");
    expect(js).not.toContain(": boolean");
  });

  test("failing stub returns hints", () => {
    const result = runContractTests(
      conditionalContract,
      conditionalContract.stub,
      sampleTests,
    );
    expect(result.pass).toBe(false);
    expect(result.hints.length).toBeGreaterThan(0);
  });

  test("correct implementation passes all tests", () => {
    const code = `function checkValue(value: number): boolean {
      return value % 2 === 0;
    }`;
    const result = runContractTests(conditionalContract, code, sampleTests);
    expect(result.pass).toBe(true);
    expect(result.results.every((r) => r.pass)).toBe(true);
  });
});
