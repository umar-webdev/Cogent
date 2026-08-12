import { z } from "zod";

/** Discriminator for frontend vs backend blocks — reserved for v3+. */
export const BlockKindSchema = z.enum(["frontend", "backend"]);
export type BlockKind = z.infer<typeof BlockKindSchema>;

/** Typed port descriptor shared by all block contracts. */
export const PortSchema = z.object({
  type: z.enum(["string", "number", "boolean", "unknown", "void", "react-node"]),
  description: z.string(),
  optional: z.boolean().optional(),
});
export type Port = z.infer<typeof PortSchema>;

/** Base shape every block contract extends. */
export const BlockContractBaseSchema = z.object({
  /** Stable identifier, e.g. "conditional.v1" */
  id: z.string(),
  kind: BlockKindSchema,
  label: z.string(),
  inputs: z.record(z.string(), PortSchema),
  outputs: z.record(z.string(), PortSchema),
  /** Pre-filled function body shown in Monaco (spec §5). */
  stub: z.string(),
});
export type BlockContractBase = z.infer<typeof BlockContractBaseSchema>;

/** All known block contract IDs for v1 frontend blocks. */
export const FrontendBlockIdSchema = z.enum([
  "button.v1",
  "input.v1",
  "text.v1",
  "conditional.v1",
  "loop.v1",
  "state.v1",
]);
export type FrontendBlockId = z.infer<typeof FrontendBlockIdSchema>;

/** Union of all concrete frontend block contracts (extended in frontend/*.contract.ts). */
export type FrontendBlockContract = BlockContractBase & {
  kind: "frontend";
  id: FrontendBlockId;
};
