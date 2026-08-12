export type ContractTestCase = {
  name: string;
  input: Record<string, unknown>;
  expected: unknown;
  hint?: string;
};

export type TestCaseResult = {
  name: string;
  pass: boolean;
  expected: unknown;
  received: unknown;
  hint?: string;
  error?: string;
};

export type GradingResult = {
  pass: boolean;
  results: TestCaseResult[];
  hints: string[];
};

export type BlockImplementationStatus = "untouched" | "implemented" | "error";
