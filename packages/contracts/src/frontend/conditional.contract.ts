import { z } from "zod";
import { BlockContractBaseSchema, PortSchema } from "../block-base.schema.js";

export const ConditionalContractSchema = BlockContractBaseSchema.extend({
  id: z.literal("conditional.v1"),
  kind: z.literal("frontend"),
  label: z.literal("Conditional"),
  inputs: z.object({
    value: PortSchema,
  }),
  outputs: z.object({
    result: PortSchema,
  }),
});

/** Canonical conditional block — used by the first challenge (is-even). */
export const conditionalContract = ConditionalContractSchema.parse({
  id: "conditional.v1",
  kind: "frontend",
  label: "Conditional",
  inputs: {
    value: { type: "number", description: "The value to evaluate" },
  },
  outputs: {
    result: { type: "boolean", description: "Whether the condition is met" },
  },
  stub: `function checkValue(value: number): boolean {
  // Implement the condition
  return false;
}`,
});

export type ConditionalContract = z.infer<typeof ConditionalContractSchema>;
