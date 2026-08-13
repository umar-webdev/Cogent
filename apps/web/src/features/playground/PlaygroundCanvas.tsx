import { useEffect, useMemo } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type NodeChange,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { BlockNode } from "./BlockNode";
import { type CanvasBlockNode, usePlaygroundStore } from "./usePlaygroundStore";

const nodeTypes: NodeTypes = {
  blockNode: BlockNode,
};

function FitViewOnLoad({
  challengeId,
  nodeCount,
}: {
  challengeId: string;
  nodeCount: number;
}) {
  const { fitView } = useReactFlow();

  useEffect(() => {
    if (nodeCount === 0) return;
    const frame = requestAnimationFrame(() => {
      void fitView({ padding: 0.2, duration: 200 });
    });
    return () => cancelAnimationFrame(frame);
  }, [challengeId, nodeCount, fitView]);

  return null;
}

function PlaygroundFlow() {
  const challengeId = usePlaygroundStore((state) => state.challengeId);
  const nodes = usePlaygroundStore((state) => state.nodes);
  const edges = usePlaygroundStore((state) => state.edges);
  const selectedNodeId = usePlaygroundStore((state) => state.selectedNodeId);
  const connectionMessage = usePlaygroundStore((state) => state.connectionMessage);
  const setSelectedNodeId = usePlaygroundStore((state) => state.setSelectedNodeId);
  const onNodesChange = usePlaygroundStore((state) => state.onNodesChange);
  const onEdgesChange = usePlaygroundStore((state) => state.onEdgesChange);
  const onConnect = usePlaygroundStore((state) => state.onConnect);

  const flowNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        selected: node.id === selectedNodeId,
      })),
    [nodes, selectedNodeId],
  );

  function handleNodesChange(changes: NodeChange<CanvasBlockNode>[]) {
    const filtered = changes.filter((change) => change.type !== "select");
    if (filtered.length > 0) {
      onNodesChange(filtered);
    }
  }

  return (
    <div className="h-full w-full">
      <ReactFlow
        key={challengeId}
        nodes={flowNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => setSelectedNodeId(node.id)}
        onPaneClick={() => setSelectedNodeId(null)}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodesConnectable
        elementsSelectable
        deleteKeyCode={["Backspace", "Delete"]}
        proOptions={{ hideAttribution: true }}
      >
        <FitViewOnLoad challengeId={challengeId} nodeCount={nodes.length} />
        <Background gap={16} color="#1e293b" />
        <MiniMap
          nodeColor={() => "#312e81"}
          maskColor="rgba(11, 16, 32, 0.8)"
          className="!bg-slate-900"
        />
        <Controls />
      </ReactFlow>

      <div className="pointer-events-none absolute left-3 top-3 max-w-sm rounded-lg bg-slate-900/90 px-3 py-2 text-xs text-slate-400">
        Drag blocks from the library onto the canvas and wire them. Add Input + Formatter to
        generate the live form preview.
      </div>

      {selectedNodeId && (
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-slate-900/90 px-3 py-2 text-xs text-slate-400">
          Selected: <span className="text-slate-200">{selectedNodeId}</span>
        </div>
      )}

      {connectionMessage && (
        <div className="absolute bottom-3 right-3 max-w-xs rounded-lg border border-amber-700/50 bg-amber-950/90 px-3 py-2 text-xs text-amber-200">
          {connectionMessage}
        </div>
      )}
    </div>
  );
}

export function PlaygroundCanvas() {
  return (
    <ReactFlowProvider>
      <PlaygroundFlow />
    </ReactFlowProvider>
  );
}
