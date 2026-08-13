import { describe, expect, test } from "bun:test";
import { validatorContract } from "@cogent/contracts";
import type { ContractTestCase } from "./types.js";
import { invokeBlockFunction, runContractTests, toRunnableJs } from "./runContractTests.js";

const genericValidatorTests: ContractTestCase[] = [
  {
    name: "empty value is rejected",
    input: { value: "" },
    expected: { valid: false },
    match: "partial",
  },
  {
    name: "returns valid + message shape",
    input: { value: "sample" },
    expected: null,
    match: "validator_shape",
  },
];

const phoneValidator = `function validateInput(value: string): { valid: boolean; message: string } {
  if (!value.trim()) {
    return { valid: false, message: "This field is required." };
  }

  const phoneRegex = /^[6-9]\\d{9}$/;

  if (!phoneRegex.test(value.trim())) {
    return {
      valid: false,
      message: "Please enter a valid 10-digit phone number.",
    };
  }

  return { valid: true, message: "" };
}`;

describe("validator toRunnableJs", () => {
  test("strips validator return type and runs phone validation", () => {
    const js = toRunnableJs(phoneValidator);
    expect(js).not.toContain(": string");
    expect(js).not.toContain(": boolean");
    expect(js).not.toMatch(/function validateInput\([^)]*\)\s*:/);

    const empty = invokeBlockFunction(phoneValidator, "validateInput", { value: "" });
    expect(empty).toEqual({ valid: false, message: "This field is required." });

    const bad = invokeBlockFunction(phoneValidator, "validateInput", { value: "12345" });
    expect(bad).toEqual({
      valid: false,
      message: "Please enter a valid 10-digit phone number.",
    });

    const good = invokeBlockFunction(phoneValidator, "validateInput", { value: "9876543210" });
    expect(good).toEqual({ valid: true, message: "" });
  });

  test("generic validator tests pass for custom phone validator", () => {
    const result = runContractTests(validatorContract, phoneValidator, genericValidatorTests);
    expect(result.pass).toBe(true);
  });
});
