import { z } from "zod";
import { BlockContractBaseSchema, PortSchema } from "../block-base.schema.js";

export const InputContractSchema = BlockContractBaseSchema.extend({
  id: z.literal("input.v1"),
  kind: z.literal("frontend"),
  label: z.literal("Input"),
  inputs: z.object({
    value: PortSchema,
    onChange: PortSchema,
    placeholder: PortSchema.optional(),
  }),
  outputs: z.object({
    value: PortSchema,
  }),
});

export const inputContract = InputContractSchema.parse({
  id: "input.v1",
  kind: "frontend",
  label: "Input",
  inputs: {
    value: { type: "string", description: "Current input value" },
    onChange: { type: "unknown", description: "Handler called when the value changes" },
    placeholder: { type: "string", description: "Placeholder text", optional: true },
  },
  outputs: {
    value: { type: "string", description: "The latest value entered by the user" },
  },
  stub: `function renderInput(props: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}): JSX.Element {
  // Implement the input component
  return (
    <input
      value={props.value}
      placeholder={props.placeholder}
      onChange={(e) => props.onChange(e.target.value)}
    />
  );
}`,
});

export type InputContract = z.infer<typeof InputContractSchema>;
