import type { BlockIconName } from "@cogent/block-registry";
import type { FrontendBlockId } from "@cogent/contracts";
import type { BlockImplementationStatus, ContractTestCase } from "@cogent/grading-engine";

/** Optional on input.v1 nodes — HTML input type in assembly preview. */
export type InputFieldType =
  | "text"
  | "email"
  | "password"
  | "tel"
  | "number"
  | "url";

export type ChallengeCanvasNodeData = {
  blockId: FrontendBlockId;
  label: string;
  icon: BlockIconName;
  status: BlockImplementationStatus;
  fieldType?: InputFieldType;
};

export type ChallengeCanvasNode = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: ChallengeCanvasNodeData;
};

export type ChallengeCanvasEdge = {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
};

export type AssemblyKind = "is-even" | "greeting-form" | "sandbox";

export type ChallengeDefinition = {
  id: string;
  title: string;
  description: string;
  trackId: string;
  trackTitle: string;
  assemblyKind: AssemblyKind;
  /** Block the learner must implement for this challenge */
  focusBlockId: FrontendBlockId;
  implementHint: string;
  assemblyHint: string;
  previewBlockLabel: string;
  nodes: ChallengeCanvasNode[];
  edges: ChallengeCanvasEdge[];
  codeByNodeId: Record<string, string>;
  selectedNodeId: string | null;
  /** If true, assembly preview is always shown (interactive demo) */
  assemblyPreviewAlways?: boolean;
  getTestsForBlock: (blockId: FrontendBlockId, nodeId?: string) => ContractTestCase[];
};

/** JSON canvas documents lose literal unions — normalize here once. */
export type ChallengeCanvasDocument = {
  id: string;
  title: string;
  description: string;
  trackId: string;
  assemblyKind: string;
  focusBlockId: string;
  implementHint: string;
  assemblyHint: string;
  previewBlockLabel: string;
  assemblyPreviewAlways?: boolean;
  selectedNodeId: string | null;
  nodes: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data: {
      blockId: string;
      label: string;
      icon: string;
      status: string;
      fieldType?: string;
    };
  }>;
  edges: ChallengeCanvasEdge[];
  codeByNodeId: Record<string, string>;
  testsByBlockId: Record<string, string>;
  testsByNodeId?: Record<string, string>;
};

export function cloneChallengeDefinition(challenge: ChallengeDefinition): ChallengeDefinition {
  return {
    ...challenge,
    nodes: structuredClone(challenge.nodes),
    edges: structuredClone(challenge.edges),
    codeByNodeId: { ...challenge.codeByNodeId },
  };
}

export function defineChallenge(
  canvas: ChallengeCanvasDocument,
  options: {
    trackTitle: string;
    getTestsForBlock: ChallengeDefinition["getTestsForBlock"];
  },
): ChallengeDefinition {
  return cloneChallengeDefinition({
    id: canvas.id,
    title: canvas.title,
    description: canvas.description,
    trackId: canvas.trackId,
    trackTitle: options.trackTitle,
    assemblyKind: canvas.assemblyKind as AssemblyKind,
    focusBlockId: canvas.focusBlockId as FrontendBlockId,
    implementHint: canvas.implementHint,
    assemblyHint: canvas.assemblyHint,
    previewBlockLabel: canvas.previewBlockLabel,
    assemblyPreviewAlways: canvas.assemblyPreviewAlways,
    nodes: canvas.nodes as ChallengeCanvasNode[],
    edges: canvas.edges,
    codeByNodeId: { ...canvas.codeByNodeId },
    selectedNodeId: canvas.selectedNodeId,
    getTestsForBlock: options.getTestsForBlock,
  });
}
