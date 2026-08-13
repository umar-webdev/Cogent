import { DEFAULT_CHALLENGE } from "@cogent/content";
import type { FrontendBlockId } from "@cogent/contracts";
import { getConnectionViolation, isConnectionAllowed } from "@cogent/contracts";
import type { BlockImplementationStatus, GradingResult } from "@cogent/grading-engine";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from "@xyflow/react";
import { create } from "zustand";
import { getBlockDefinition, type BlockIconName } from "@cogent/block-registry";
import { snapshotFromChallenge } from "../canvas/persistence";
import { transitionBlockStatus } from "../execution/blockStateMachine";

export type CanvasBlockNode = Node<{
  blockId: FrontendBlockId;
  label: string;
  icon: BlockIconName;
  status: BlockImplementationStatus;
}>;

type PlaygroundState = {
  challengeTitle: string;
  challengeDescription: string;
  nodes: CanvasBlockNode[];
  edges: Edge[];
  selectedNodeId: string | null;
  codeByNodeId: Record<string, string>;
  gradingResult: GradingResult | null;
  connectionMessage: string | null;
  setSelectedNodeId: (nodeId: string | null) => void;
  setNodeCode: (nodeId: string, code: string) => void;
  setNodeStatus: (nodeId: string, status: BlockImplementationStatus) => void;
  setGradingResult: (result: GradingResult | null) => void;
  addBlockToCanvas: (blockId: FrontendBlockId) => void;
  onNodesChange: (changes: NodeChange<CanvasBlockNode>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  resetChallenge: () => void;
  getTestsForSelectedBlock: () => ReturnType<typeof DEFAULT_CHALLENGE.getTestsForBlock>;
};

function loadChallengeState() {
  const snapshot = snapshotFromChallenge(DEFAULT_CHALLENGE);
  return {
    challengeTitle: DEFAULT_CHALLENGE.title,
    challengeDescription: DEFAULT_CHALLENGE.description,
    nodes: snapshot.nodes,
    edges: snapshot.edges,
    selectedNodeId: snapshot.selectedNodeId,
    codeByNodeId: snapshot.codeByNodeId,
  };
}

export const usePlaygroundStore = create<PlaygroundState>((set, get) => ({
  ...loadChallengeState(),
  gradingResult: null,
  connectionMessage: null,

  setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId, gradingResult: null }),

  setNodeCode: (nodeId, code) =>
    set((state) => {
      const node = state.nodes.find((n) => n.id === nodeId);
      const nextStatus = node
        ? transitionBlockStatus(node.data.status, "code_changed")
        : undefined;

      return {
        codeByNodeId: { ...state.codeByNodeId, [nodeId]: code },
        gradingResult: null,
        nodes: nextStatus
          ? state.nodes.map((n) =>
              n.id === nodeId ? { ...n, data: { ...n.data, status: nextStatus } } : n,
            )
          : state.nodes,
      };
    }),

  setNodeStatus: (nodeId, status) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, status } } : node,
      ),
    })),

  setGradingResult: (result) => set({ gradingResult: result }),

  addBlockToCanvas: (blockId) => {
    const definition = getBlockDefinition(blockId);
    const id = `${blockId}-${crypto.randomUUID().slice(0, 8)}`;
    set((state) => ({
      nodes: [
        ...state.nodes,
        {
          id,
          type: "blockNode",
          position: { x: 140, y: 100 },
          data: {
            blockId,
            label: definition.label,
            icon: definition.icon,
            status: "untouched" as const,
          },
        },
      ],
      selectedNodeId: id,
      codeByNodeId: { ...state.codeByNodeId, [id]: definition.contract.stub },
      gradingResult: null,
    }));
  },

  onNodesChange: (changes) =>
    set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) })),

  onEdgesChange: (changes) =>
    set((state) => ({ edges: applyEdgeChanges(changes, state.edges) })),

  onConnect: (connection) => {
    const { nodes, edges } = get();
    const source = nodes.find((node) => node.id === connection.source);
    const target = nodes.find((node) => node.id === connection.target);
    if (!source || !target) return;

    const violation = getConnectionViolation(source.data.blockId, target.data.blockId);
    if (violation) {
      set({ connectionMessage: violation.reason ?? "This connection is not allowed." });
      return;
    }

    if (!isConnectionAllowed(source.data.blockId, target.data.blockId)) {
      set({
        connectionMessage: `Cannot connect ${source.data.label} → ${target.data.label}.`,
      });
      return;
    }

    set({
      edges: addEdge({ ...connection, animated: true }, edges),
      connectionMessage: null,
    });
  },

  resetChallenge: () =>
    set({ ...loadChallengeState(), gradingResult: null, connectionMessage: null }),

  getTestsForSelectedBlock: () => {
    const state = get();
    const selected = state.nodes.find((node) => node.id === state.selectedNodeId);
    return selected ? DEFAULT_CHALLENGE.getTestsForBlock(selected.data.blockId) : [];
  },
}));

export function getSelectedNode(state: PlaygroundState): CanvasBlockNode | undefined {
  return state.nodes.find((node) => node.id === state.selectedNodeId);
}

export function getSelectedCode(state: PlaygroundState): string {
  return state.selectedNodeId ? (state.codeByNodeId[state.selectedNodeId] ?? "") : "";
}
