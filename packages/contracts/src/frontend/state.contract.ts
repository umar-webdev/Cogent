import { z } from "zod";
import { BlockContractBaseSchema, PortSchema } from "../block-base.schema.js";

export const StateContractSchema = BlockContractBaseSchema.extend({
  id: z.literal("state.v1"),
  kind: z.literal("frontend"),
  label: z.literal("State"),
  inputs: z.object({
    initialValue: PortSchema,
  }),
  outputs: z.object({
    value: PortSchema,
    setValue: PortSchema,
  }),
});

export const stateContract = StateContractSchema.parse({
  id: "state.v1",
  kind: "frontend",
  label: "State",
  inputs: {
    initialValue: { type: "unknown", description: "Initial state value" },
  },
  outputs: {
    value: { type: "unknown", description: "Current state value" },
    setValue: { type: "unknown", description: "Function to update the state value" },
  },
  stub: `function useBlockState<T>(initialValue: T): [T, (next: T) => void] {
  // Implement local state for this block
  // Return [value, setValue]
  throw new Error("Not implemented");
}`,
});

export type StateContract = z.infer<typeof StateContractSchema>;
