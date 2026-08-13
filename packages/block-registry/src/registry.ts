import {
  FRONTEND_BLOCK_CONTRACTS,
  type FrontendBlockId,
} from "@cogent/contracts";
import type { BlockCategory, BlockDefinition, BlockIconName } from "./types.js";

const CATEGORY_BY_BLOCK: Record<FrontendBlockId, BlockCategory> = {
  "button.v1": "input",
  "input.v1": "input",
  "text.v1": "display",
  "conditional.v1": "logic",
  "formatter.v1": "logic",
  "validator.v1": "logic",
  "loop.v1": "logic",
  "state.v1": "state",
};

const ICON_BY_BLOCK: Record<FrontendBlockId, BlockIconName> = {
  "button.v1": "button",
  "input.v1": "input",
  "text.v1": "text",
  "conditional.v1": "conditional",
  "formatter.v1": "formatter",
  "validator.v1": "validator",
  "loop.v1": "loop",
  "state.v1": "state",
};

const DESCRIPTION_BY_BLOCK: Record<FrontendBlockId, string> = {
  "button.v1": "Clickable control that triggers an action.",
  "input.v1": "Captures text from the user.",
  "text.v1": "Displays read-only content.",
  "conditional.v1": "Branches logic based on a boolean condition.",
  "formatter.v1": "Combines form fields into display text.",
  "validator.v1": "Checks a field value and returns an error message when invalid.",
  "loop.v1": "Repeats rendering for each item in a list.",
  "state.v1": "Holds mutable data shared across blocks.",
};

function toDefinition(id: FrontendBlockId): BlockDefinition {
  const contract = FRONTEND_BLOCK_CONTRACTS[id];
  return {
    id,
    label: contract.label,
    category: CATEGORY_BY_BLOCK[id],
    description: DESCRIPTION_BY_BLOCK[id],
    icon: ICON_BY_BLOCK[id],
    contract,
  };
}

export const BLOCK_REGISTRY: BlockDefinition[] = (
  Object.keys(FRONTEND_BLOCK_CONTRACTS) as FrontendBlockId[]
).map(toDefinition);

export const BLOCK_REGISTRY_BY_ID = Object.fromEntries(
  BLOCK_REGISTRY.map((block) => [block.id, block]),
) as Record<FrontendBlockId, BlockDefinition>;

export function getBlockDefinition(id: FrontendBlockId): BlockDefinition {
  return BLOCK_REGISTRY_BY_ID[id];
}

export function listBlocksByCategory(category: BlockCategory): BlockDefinition[] {
  return BLOCK_REGISTRY.filter((block) => block.category === category);
}

export const BLOCK_CATEGORIES: { id: BlockCategory; label: string }[] = [
  { id: "input", label: "Input" },
  { id: "display", label: "Display" },
  { id: "logic", label: "Logic" },
  { id: "state", label: "State" },
];
