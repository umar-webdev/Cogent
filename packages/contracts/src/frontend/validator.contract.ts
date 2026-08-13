import { z } from "zod";
import { BlockContractBaseSchema, PortSchema } from "../block-base.schema.js";

export const ValidatorContractSchema = BlockContractBaseSchema.extend({
  id: z.literal("validator.v1"),
  kind: z.literal("frontend"),
  label: z.literal("Validator"),
  inputs: z.object({
    value: PortSchema,
  }),
  outputs: z.object({
    valid: PortSchema,
    message: PortSchema,
  }),
});

export const validatorContract = ValidatorContractSchema.parse({
  id: "validator.v1",
  kind: "frontend",
  label: "Validator",
  inputs: {
    value: { type: "string", description: "Value to validate" },
  },
  outputs: {
    valid: { type: "boolean", description: "Whether the value passes validation" },
    message: { type: "string", description: "Error message when invalid" },
  },
  stub: `function validateInput(value: string): { valid: boolean; message: string } {
  // Your rules: min/max length, regex, email format, password strength, etc.
  if (!value.trim()) {
    return { valid: false, message: "Required." };
  }
  return { valid: true, message: "" };
}`,
});

export type ValidatorContract = z.infer<typeof ValidatorContractSchema>;
