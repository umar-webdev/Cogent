import { z } from "zod";
import { BlockContractBaseSchema, PortSchema } from "../block-base.schema.js";

export const LoopContractSchema = BlockContractBaseSchema.extend({
  id: z.literal("loop.v1"),
  kind: z.literal("frontend"),
  label: z.literal("Loop"),
  inputs: z.object({
    items: PortSchema,
    renderItem: PortSchema,
  }),
  outputs: z.object({
    elements: PortSchema,
  }),
});

export const loopContract = LoopContractSchema.parse({
  id: "loop.v1",
  kind: "frontend",
  label: "Loop",
  inputs: {
    items: { type: "unknown", description: "Array of items to iterate over" },
    renderItem: { type: "unknown", description: "Function that renders a single item" },
  },
  outputs: {
    elements: { type: "react-node", description: "Rendered list of elements" },
  },
  stub: `function renderLoop<T>(props: {
  items: T[];
  renderItem: (item: T, index: number) => JSX.Element;
}): JSX.Element {
  // Implement the loop — map items to rendered elements
  return <>{props.items.map(props.renderItem)}</>;
}`,
});

export type LoopContract = z.infer<typeof LoopContractSchema>;
