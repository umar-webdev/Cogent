import type { ContractTestCase } from "@cogent/grading-engine";

/** Starter demo — only applied to the pre-wired email validator node. */
export const sandboxEmailValidatorTests: ContractTestCase[] = [
  {
    name: "empty email",
    input: { value: "" },
    expected: { valid: false, message: "Email is required." },
  },
  {
    name: "missing @",
    input: { value: "alex" },
    expected: { valid: false, message: "Email must contain @." },
  },
  {
    name: "valid email",
    input: { value: "alex@example.com" },
    expected: { valid: true, message: "" },
  },
];

/** Any user-added validator — rules are yours; tests only check basic contract shape. */
export const genericValidatorTests: ContractTestCase[] = [
  {
    name: "empty value is rejected",
    input: { value: "" },
    expected: { valid: false },
    match: "partial",
    hint: "Return { valid: false, message: \"...\" } when the value fails your rules.",
  },
  {
    name: "returns valid + message shape",
    input: { value: "sample" },
    expected: null,
    match: "validator_shape",
    hint: "Always return { valid: boolean, message: string } — your message text is up to you.",
  },
];

export const sandboxFormatterTests: ContractTestCase[] = [
  {
    name: "lists field values",
    input: { fields: { Name: "Alex", Email: "alex@example.com" } },
    expected: "Name: Alex · Email: alex@example.com",
    hint: "Use Object.entries(fields) to build a summary string.",
  },
  {
    name: "handles single field",
    input: { fields: { Note: "Hello" } },
    expected: "Note: Hello",
  },
];
