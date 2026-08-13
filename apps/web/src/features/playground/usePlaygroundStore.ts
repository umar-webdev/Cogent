import {
  DEFAULT_CHALLENGE,
  getChallengeById,
  type AssemblyKind,
  type ChallengeDefinition,
} from "@cogent/content";
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
import {
  normalizeInputFieldType,
  type InputFieldType,
} from "./inputFieldTypes";

export type { InputFieldType };

export type CanvasBlockNode = Node<{
  blockId: FrontendBlockId;
  label: string;
  icon: BlockIconName;
  status: BlockImplementationStatus;
  /** HTML input type for input.v1 blocks in sandbox assembly. */
  fieldType?: InputFieldType;
}>;

type PlaygroundState = {
  challengeId: string;
  challengeTitle: string;
  challengeDescription: string;
  assemblyKind: AssemblyKind;
  implementHint: string;
  assemblyHint: string;
  previewBlockLabel: string;
  assemblyPreviewAlways: boolean;
  activeChallenge: ChallengeDefinition;
  nodes: CanvasBlockNode[];
  edges: Edge[];
  selectedNodeId: string | null;
  codeByNodeId: Record<string, string>;
  gradingResult: GradingResult | null;
  connectionMessage: string | null;
  setSelectedNodeId: (nodeId: string | null) => void;
  setNodeCode: (nodeId: string, code: string) => void;
  setNodeLabel: (nodeId: string, label: string) => void;
  setNodeFieldType: (nodeId: string, fieldType: InputFieldType) => void;
  setNodeStatus: (nodeId: string, status: BlockImplementationStatus) => void;
  setGradingResult: (result: GradingResult | null) => void;
  addBlockToCanvas: (blockId: FrontendBlockId) => void;
  onNodesChange: (changes: NodeChange<CanvasBlockNode>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  loadChallenge: (challengeId: string) => void;
  resetChallenge: () => void;
  getTestsForSelectedBlock: () => ReturnType<ChallengeDefinition["getTestsForBlock"]>;
};

function stateFromChallenge(challenge: ChallengeDefinition) {
  const snapshot = snapshotFromChallenge(challenge);
  return {
    challengeId: challenge.id,
    challengeTitle: challenge.title,
    challengeDescription: challenge.description,
    assemblyKind: challenge.assemblyKind,
    implementHint: challenge.implementHint,
    assemblyHint: challenge.assemblyHint,
    previewBlockLabel: challenge.previewBlockLabel,
    assemblyPreviewAlways: challenge.assemblyPreviewAlways ?? false,
    activeChallenge: challenge,
    nodes: snapshot.nodes.map((node) =>
      node.data.blockId === "input.v1"
        ? {
            ...node,
            data: {
              ...node.data,
              fieldType: normalizeInputFieldType(node.data.fieldType),
            },
          }
        : node,
    ),
    edges: snapshot.edges,
    selectedNodeId: snapshot.selectedNodeId,
    codeByNodeId: snapshot.codeByNodeId,
  };
}

const initialChallenge =
  getChallengeById(DEFAULT_CHALLENGE.id) ?? DEFAULT_CHALLENGE;

export const usePlaygroundStore = create<PlaygroundState>((set, get) => ({
  ...stateFromChallenge(initialChallenge),
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

  setNodeLabel: (nodeId, label) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, label: label.trim() || node.data.label } }
          : node,
      ),
      gradingResult: null,
    })),

  setNodeFieldType: (nodeId, fieldType) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId && node.data.blockId === "input.v1"
          ? { ...node, data: { ...node.data, fieldType } }
          : node,
      ),
      gradingResult: null,
    })),

  setNodeStatus: (nodeId, status) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, status } } : node,
      ),
    })),

  setGradingResult: (result) => set({ gradingResult: result }),

  addBlockToCanvas: (blockId) => {
    const definition = getBlockDefinition(blockId);
    const id = `${blockId.replace(".v1", "")}-${crypto.randomUUID().slice(0, 8)}`;
    const { nodes } = get();
    const inputCount = nodes.filter((node) => node.data.blockId === "input.v1").length;
    const defaultLabel =
      blockId === "input.v1"
        ? inputCount === 0
          ? "Name"
          : `Field ${inputCount + 1}`
        : definition.label;

    set((state) => ({
      nodes: [
        ...state.nodes,
        {
          id,
          type: "blockNode",
          position: { x: 140 + (state.nodes.length % 3) * 40, y: 80 + (state.nodes.length % 4) * 60 },
          data: {
            blockId,
            label: defaultLabel,
            icon: definition.icon,
            status:
              blockId === "input.v1" || blockId === "button.v1" || blockId === "text.v1"
                ? ("implemented" as const)
                : ("untouched" as const),
            ...(blockId === "input.v1" ? { fieldType: "text" as const } : {}),
          },
        },
      ],
      selectedNodeId: id,
      codeByNodeId: { ...state.codeByNodeId, [id]: definition.contract.stub },
      gradingResult: null,
      connectionMessage: null,
    }));
  },

  onNodesChange: (changes) =>
    set((state) => {
      const nodes = applyNodeChanges(changes, state.nodes);
      const removedIds = changes
        .filter((change) => change.type === "remove")
        .map((change) => change.id);
      if (removedIds.length === 0) {
        return { nodes };
      }

      const codeByNodeId = { ...state.codeByNodeId };
      for (const id of removedIds) {
        delete codeByNodeId[id];
      }

      return {
        nodes,
        codeByNodeId,
        selectedNodeId: removedIds.includes(state.selectedNodeId ?? "")
          ? null
          : state.selectedNodeId,
        gradingResult: null,
      };
    }),

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

  loadChallenge: (challengeId) => {
    const challenge = getChallengeById(challengeId);
    if (!challenge) return;
    set({
      ...stateFromChallenge(challenge),
      gradingResult: null,
      connectionMessage: null,
    });
  },

  resetChallenge: () => {
    const { challengeId } = get();
    const challenge = getChallengeById(challengeId);
    if (!challenge) return;
    set({
      ...stateFromChallenge(challenge),
      gradingResult: null,
      connectionMessage: null,
    });
  },

  getTestsForSelectedBlock: () => {
    const state = get();
    const selected = state.nodes.find((node) => node.id === state.selectedNodeId);
    return selected
      ? state.activeChallenge.getTestsForBlock(selected.data.blockId, selected.id)
      : [];
  },
}));

export function getSelectedNode(state: PlaygroundState): CanvasBlockNode | undefined {
  return state.nodes.find((node) => node.id === state.selectedNodeId);
}

export function getSelectedCode(state: PlaygroundState): string {
  return state.selectedNodeId ? (state.codeByNodeId[state.selectedNodeId] ?? "") : "";
}
