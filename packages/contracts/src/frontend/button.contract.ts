import { z } from "zod";
import { BlockContractBaseSchema, PortSchema } from "../block-base.schema.js";

export const ButtonContractSchema = BlockContractBaseSchema.extend({
  id: z.literal("button.v1"),
  kind: z.literal("frontend"),
  label: z.literal("Button"),
  inputs: z.object({
    label: PortSchema,
    onClick: PortSchema,
    disabled: PortSchema.optional(),
  }),
  outputs: z.object({
    clicked: PortSchema,
  }),
});

export const buttonContract = ButtonContractSchema.parse({
  id: "button.v1",
  kind: "frontend",
  label: "Button",
  inputs: {
    label: { type: "string", description: "Text displayed on the button" },
    onClick: { type: "unknown", description: "Handler invoked when the button is clicked" },
    disabled: { type: "boolean", description: "Whether the button is disabled", optional: true },
  },
  outputs: {
    clicked: { type: "void", description: "Emitted after a successful click" },
  },
  stub: `function renderButton(props: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}): JSX.Element {
  // Implement the button component
  return <button disabled={props.disabled}>{props.label}</button>;
}`,
});

export type ButtonContract = z.infer<typeof ButtonContractSchema>;
