import type { BlockIconName } from "@cogent/block-registry";
import type { FrontendBlockId } from "@cogent/contracts";
import type { BlockImplementationStatus, ContractTestCase } from "@cogent/grading-engine";
import { conditionalsTrack } from "../track.meta.js";
import { isEvenTests } from "./01-is-even.tests.js";
import canvasJson from "./01-is-even.canvas.json";

export type ChallengeCanvasNode = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    blockId: FrontendBlockId;
    label: string;
    icon: BlockIconName;
    status: BlockImplementationStatus;
  };
};

export type ChallengeCanvasEdge = {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
};

export type ChallengeDefinition = {
  id: string;
  title: string;
  description: string;
  trackId: string;
  track: typeof conditionalsTrack;
  nodes: ChallengeCanvasNode[];
  edges: ChallengeCanvasEdge[];
  codeByNodeId: Record<string, string>;
  selectedNodeId: string | null;
  getTestsForBlock: (blockId: FrontendBlockId) => ContractTestCase[];
};

const testRegistry = {
  "is-even-tests": isEvenTests,
} as const;

export const isEvenChallenge: ChallengeDefinition = {
  id: canvasJson.id,
  title: canvasJson.title,
  description: canvasJson.description,
  trackId: canvasJson.trackId,
  track: conditionalsTrack,
  nodes: canvasJson.nodes as ChallengeCanvasNode[],
  edges: canvasJson.edges as ChallengeCanvasEdge[],
  codeByNodeId: canvasJson.codeByNodeId,
  selectedNodeId: canvasJson.selectedNodeId,
  getTestsForBlock: (blockId) => {
    const key = canvasJson.testsByBlockId[blockId as keyof typeof canvasJson.testsByBlockId];
    if (!key) return [];
    return testRegistry[key as keyof typeof testRegistry] ?? [];
  },
};

export { isEvenTests };
