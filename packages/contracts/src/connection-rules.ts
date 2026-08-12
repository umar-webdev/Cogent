import type { FrontendBlockId } from "./block-base.schema.js";

export type ConnectionRule = {
  from: FrontendBlockId;
  to: FrontendBlockId;
  /** Human-readable reason shown in the canvas when a connection is invalid. */
  reason?: string;
};

/**
 * Which output ports on `from` may connect to which input ports on `to`.
 * Keys are port names; values are compatible port types or block-level wildcards.
 */
export type PortCompatibility = {
  fromPort: string;
  toPort: string;
  compatibleTypes: Array<"string" | "number" | "boolean" | "unknown" | "void" | "react-node">;
};

/** Legal block-to-block connections for v1 frontend blocks. */
export const ALLOWED_CONNECTIONS: ConnectionRule[] = [
  { from: "input.v1", to: "conditional.v1" },
  { from: "input.v1", to: "text.v1" },
  { from: "input.v1", to: "state.v1" },
  { from: "state.v1", to: "conditional.v1" },
  { from: "state.v1", to: "text.v1" },
  { from: "state.v1", to: "input.v1" },
  { from: "conditional.v1", to: "text.v1" },
  { from: "loop.v1", to: "text.v1" },
  { from: "button.v1", to: "state.v1" },
];

/**
 * Connections that should be flagged as architectural flaws (v2 hiring rubric, spec §2).
 * Frontend blocks must not connect directly to backend blocks until v5.
 */
export const FORBIDDEN_CONNECTIONS: ConnectionRule[] = [
  {
    from: "button.v1",
    to: "conditional.v1",
    reason: "Event handlers should update state first, not wire directly to logic blocks.",
  },
];

export function isConnectionAllowed(from: FrontendBlockId, to: FrontendBlockId): boolean {
  if (FORBIDDEN_CONNECTIONS.some((rule) => rule.from === from && rule.to === to)) {
    return false;
  }
  return ALLOWED_CONNECTIONS.some((rule) => rule.from === from && rule.to === to);
}

export function getConnectionViolation(
  from: FrontendBlockId,
  to: FrontendBlockId,
): ConnectionRule | undefined {
  return FORBIDDEN_CONNECTIONS.find((rule) => rule.from === from && rule.to === to);
}
