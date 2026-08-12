import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { BlockNode } from "./BlockNode";
import { usePlaygroundStore } from "./usePlaygroundStore";

const nodeTypes: NodeTypes = {
  blockNode: BlockNode,
};

export function PlaygroundCanvas() {
  const nodes = usePlaygroundStore((state) => state.nodes);
  const edges = usePlaygroundStore((state) => state.edges);
  const selectedNodeId = usePlaygroundStore((state) => state.selectedNodeId);
  const connectionMessage = usePlaygroundStore((state) => state.connectionMessage);
  const setSelectedNodeId = usePlaygroundStore((state) => state.setSelectedNodeId);
  const onNodesChange = usePlaygroundStore((state) => state.onNodesChange);
  const onEdgesChange = usePlaygroundStore((state) => state.onEdgesChange);
  const onConnect = usePlaygroundStore((state) => state.onConnect);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => setSelectedNodeId(node.id)}
        onPaneClick={() => setSelectedNodeId(null)}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        nodesConnectable
        elementsSelectable
        deleteKeyCode={["Backspace", "Delete"]}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={16} color="#1e293b" />
        <MiniMap
          nodeColor={() => "#312e81"}
          maskColor="rgba(11, 16, 32, 0.8)"
          className="!bg-slate-900"
        />
        <Controls />
      </ReactFlow>

      <div className="pointer-events-none absolute left-3 top-3 rounded-lg bg-slate-900/90 px-3 py-2 text-xs text-slate-400">
        Drag from a block&apos;s right handle to another&apos;s left handle to wire them.
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
