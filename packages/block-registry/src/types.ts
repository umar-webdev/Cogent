import type { BlockContractBase, FrontendBlockId } from "@cogent/contracts";

export type BlockCategory = "input" | "display" | "logic" | "state";

/** Semantic icon id — mapped to Tabler icons in the web app. */
export type BlockIconName =
  | "button"
  | "input"
  | "text"
  | "conditional"
  | "formatter"
  | "validator"
  | "loop"
  | "state";

export type BlockDefinition = {
  id: FrontendBlockId;
  label: string;
  category: BlockCategory;
  description: string;
  icon: BlockIconName;
  contract: BlockContractBase;
};
