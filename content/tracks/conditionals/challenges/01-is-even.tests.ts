import type { ContractTestCase } from "@cogent/grading-engine";

export const isEvenTests: ContractTestCase[] = [
  {
    name: "4 is even",
    input: { value: 4 },
    expected: true,
    hint: "Use modulo (%) to check whether the value is divisible by 2.",
  },
  {
    name: "3 is odd",
    input: { value: 3 },
    expected: false,
  },
  {
    name: "0 is even",
    input: { value: 0 },
    expected: true,
  },
  {
    name: "-2 is even",
    input: { value: -2 },
    expected: true,
  },
];
