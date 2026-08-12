import type { BlockContractBase, FrontendBlockId } from "./block-base.schema.js";
import { buttonContract } from "./frontend/button.contract.js";
import { conditionalContract } from "./frontend/conditional.contract.js";
import { inputContract } from "./frontend/input.contract.js";
import { loopContract } from "./frontend/loop.contract.js";
import { stateContract } from "./frontend/state.contract.js";
import { textContract } from "./frontend/text.contract.js";

export * from "./block-base.schema.js";
export * from "./connection-rules.js";
export * from "./frontend/button.contract.js";
export * from "./frontend/input.contract.js";
export * from "./frontend/text.contract.js";
export * from "./frontend/conditional.contract.js";
export * from "./frontend/loop.contract.js";
export * from "./frontend/state.contract.js";

/** All v1 frontend block definitions, keyed by contract id. */
export const FRONTEND_BLOCK_CONTRACTS = {
  "button.v1": buttonContract,
  "input.v1": inputContract,
  "text.v1": textContract,
  "conditional.v1": conditionalContract,
  "loop.v1": loopContract,
  "state.v1": stateContract,
} as const satisfies Record<FrontendBlockId, BlockContractBase>;

export type FrontendBlockContracts = typeof FRONTEND_BLOCK_CONTRACTS;

export function getBlockContract(id: FrontendBlockId): BlockContractBase {
  return FRONTEND_BLOCK_CONTRACTS[id];
}

export function listFrontendBlockIds(): FrontendBlockId[] {
  return Object.keys(FRONTEND_BLOCK_CONTRACTS) as FrontendBlockId[];
}
