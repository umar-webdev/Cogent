import type { ContractTestCase } from "@cogent/grading-engine";

export const greetingFormTests: ContractTestCase[] = [
  {
    name: "Jane Doe",
    input: { fields: { "First name": "Jane", "Last name": "Doe" } },
    expected: "Hello, Jane Doe!",
    hint: 'Read fields["First name"] and fields["Last name"] to build the greeting.',
  },
  {
    name: "single name",
    input: { fields: { "First name": "Alex", "Last name": "" } },
    expected: "Hello, Alex!",
  },
  {
    name: "trimmed output",
    input: { fields: { "First name": "  Sam  ", "Last name": "  Lee  " } },
    expected: "Hello, Sam Lee!",
    hint: "Consider trimming whitespace from the field values.",
  },
];
