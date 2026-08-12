import type { BlockContractBase } from "@cogent/contracts";
import type { ContractTestCase, GradingResult } from "@cogent/grading-engine";
import { runContractTests } from "@cogent/grading-engine";

export type BlockRunResult = {
  ok: boolean;
  grading: GradingResult;
};

/**
 * v1 Sandpack-backed execution seam — v3 swaps the internals, not this signature.
 */
export async function runBlock(
  contract: BlockContractBase,
  userCode: string,
  testCases: ContractTestCase[],
): Promise<BlockRunResult> {
  const grading = runContractTests(contract, userCode, testCases);
  return { ok: grading.pass, grading };
}
