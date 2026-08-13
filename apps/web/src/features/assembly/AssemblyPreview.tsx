import { useMemo } from "react";
import {
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import { Panel } from "@cogent/ui";
import { compileAssembly, canAssemble } from "./compileAssembly";
import type { CanvasBlockNode } from "../playground/usePlaygroundStore";
import { usePlaygroundStore } from "../playground/usePlaygroundStore";
import type { Edge } from "@xyflow/react";

function buildAssemblyRevision(
  nodes: CanvasBlockNode[],
  edges: Edge[],
  codeByNodeId: Record<string, string>,
): string {
  const inputSig = nodes
    .filter((node) => node.data.blockId === "input.v1")
    .map((node) => `${node.id}:${node.data.label}:${node.data.fieldType ?? "text"}`)
    .join(",");
  const logicSig = nodes
    .filter((node) =>
      node.data.blockId === "validator.v1" || node.data.blockId === "formatter.v1",
    )
    .map((node) => `${node.id}:${codeByNodeId[node.id]?.length ?? 0}`)
    .join(",");
  return `${nodes.length}|${edges.length}|${inputSig}|${logicSig}`;
}

export function AssemblyPreview() {
  const challengeId = usePlaygroundStore((state) => state.challengeId);
  const nodes = usePlaygroundStore((state) => state.nodes);
  const edges = usePlaygroundStore((state) => state.edges);
  const codeByNodeId = usePlaygroundStore((state) => state.codeByNodeId);
  const assemblyKind = usePlaygroundStore((state) => state.assemblyKind);
  const assemblyHint = usePlaygroundStore((state) => state.assemblyHint);
  const previewBlockLabel = usePlaygroundStore((state) => state.previewBlockLabel);
  const assemblyPreviewAlways = usePlaygroundStore((state) => state.assemblyPreviewAlways);

  const files = compileAssembly({ nodes, edges, codeByNodeId, assemblyKind });
  const canShow = canAssemble(nodes, edges, assemblyKind, assemblyPreviewAlways);
  const ready = canShow && files != null;
  const isSandbox = assemblyKind === "sandbox";
  const waitingForBlocks = canShow && !files;

  const assemblyRevision = useMemo(
    () => buildAssemblyRevision(nodes, edges, codeByNodeId),
    [nodes, edges, codeByNodeId],
  );

  return (
    <Panel title="Assembly preview" className="min-h-[280px]">
      {waitingForBlocks && (
        <p className="text-sm text-slate-400">
          Challenge blocks did not load — use <strong className="text-slate-200">Reset</strong> or
          pick the challenge again.
        </p>
      )}

      {!canShow && !waitingForBlocks && (
        <p className="text-sm text-slate-400">
          {isSandbox ? (
            <>
              Your canvas is empty until you add blocks. Drop at least one{" "}
              <strong className="text-slate-200">Input</strong> and a{" "}
              <strong className="text-slate-200">Formatter</strong> to generate the live form
              preview here.
            </>
          ) : (
            <>
              Implement and pass tests on the{" "}
              <strong className="text-slate-200">{previewBlockLabel}</strong> block to assemble the
              live app preview.
            </>
          )}
        </p>
      )}

      {ready && (assemblyPreviewAlways || isSandbox) && (
        <p className="mb-3 text-sm text-slate-400">{assemblyHint}</p>
      )}

      {ready && files && (
        <SandpackProvider
          key={`${challengeId}:${assemblyRevision}`}
          template="react-ts"
          files={files}
          theme="dark"
        >
          <SandpackLayout
            style={{
              borderRadius: 8,
              overflow: "hidden",
              minHeight: 280,
              border: "1px solid #1e293b",
            }}
          >
            <SandpackPreview
              showOpenInCodeSandbox={false}
              showRefreshButton
              style={{ height: 280 }}
            />
          </SandpackLayout>
        </SandpackProvider>
      )}
    </Panel>
  );
}
