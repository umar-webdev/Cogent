import { z } from "zod";
import { BlockContractBaseSchema, PortSchema } from "../block-base.schema.js";

export const FormatterContractSchema = BlockContractBaseSchema.extend({
  id: z.literal("formatter.v1"),
  kind: z.literal("frontend"),
  label: z.literal("Formatter"),
  inputs: z.object({
    firstName: PortSchema,
    lastName: PortSchema,
  }),
  outputs: z.object({
    message: PortSchema,
  }),
});

export const formatterContract = FormatterContractSchema.parse({
  id: "formatter.v1",
  kind: "frontend",
  label: "Formatter",
  inputs: {
    firstName: { type: "string", description: "User's first name" },
    lastName: { type: "string", description: "User's last name" },
  },
  outputs: {
    message: { type: "string", description: "Text shown after submit" },
  },
  stub: `function formatForm(fields: Record<string, string>): string {
  // Build output text from labeled form fields (keys match Input block labels)
  return "";
}`,
});

export type FormatterContract = z.infer<typeof FormatterContractSchema>;
