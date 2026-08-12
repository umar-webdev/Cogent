import { z } from "zod";
import { BlockContractBaseSchema, PortSchema } from "../block-base.schema.js";

export const TextContractSchema = BlockContractBaseSchema.extend({
  id: z.literal("text.v1"),
  kind: z.literal("frontend"),
  label: z.literal("Text"),
  inputs: z.object({
    content: PortSchema,
  }),
  outputs: z.object({
    rendered: PortSchema,
  }),
});

export const textContract = TextContractSchema.parse({
  id: "text.v1",
  kind: "frontend",
  label: "Text",
  inputs: {
    content: { type: "string", description: "Text to display" },
  },
  outputs: {
    rendered: { type: "react-node", description: "The rendered text node" },
  },
  stub: `function renderText(props: { content: string }): JSX.Element {
  // Implement the text display component
  return <p>{props.content}</p>;
}`,
});

export type TextContract = z.infer<typeof TextContractSchema>;
