import type { BlockContractBase, FrontendBlockId } from "@cogent/contracts";

export type BlockCategory = "input" | "display" | "logic" | "state";

export type BlockDefinition = {
  id: FrontendBlockId;
  label: string;
  category: BlockCategory;
  description: string;
  icon: string;
  contract: BlockContractBase;
};
