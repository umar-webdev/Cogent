import type { Edge, Node } from "@xyflow/react";
import type { CanvasBlockNode } from "../playground/usePlaygroundStore";

export type CanvasSnapshot = {
  nodes: CanvasBlockNode[];
  edges: Edge[];
  codeByNodeId: Record<string, string>;
  selectedNodeId: string | null;
};

export function serializeCanvas(snapshot: CanvasSnapshot): string {
  return JSON.stringify(snapshot, null, 2);
}

export function deserializeCanvas(raw: string): CanvasSnapshot {
  const parsed = JSON.parse(raw) as CanvasSnapshot;
  if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
    throw new Error("Invalid canvas snapshot.");
  }
  return parsed;
}

export function snapshotFromChallenge(challenge: {
  nodes: CanvasSnapshot["nodes"];
  edges: CanvasSnapshot["edges"];
  codeByNodeId: CanvasSnapshot["codeByNodeId"];
  selectedNodeId: string | null;
}): CanvasSnapshot {
  return {
    nodes: structuredClone(challenge.nodes) as CanvasBlockNode[],
    edges: structuredClone(challenge.edges) as Edge[],
    codeByNodeId: { ...challenge.codeByNodeId },
    selectedNodeId: challenge.selectedNodeId,
  };
}

export function toFlowNodes(nodes: CanvasBlockNode[]): Node[] {
  return nodes;
}
