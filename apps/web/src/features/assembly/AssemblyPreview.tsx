import {
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import { Panel } from "@cogent/ui";
import { compileIsEvenAssembly, canAssemble } from "./compileAssembly";
import { usePlaygroundStore } from "../playground/usePlaygroundStore";

export function AssemblyPreview() {
  const nodes = usePlaygroundStore((state) => state.nodes);
  const codeByNodeId = usePlaygroundStore((state) => state.codeByNodeId);

  const files = compileIsEvenAssembly({ nodes, codeByNodeId });
  const ready = canAssemble(nodes);

  return (
    <Panel title="Assembly preview" className="min-h-[280px]">
      {!ready && (
        <p className="text-sm text-slate-400">
          Implement and pass tests on the <strong className="text-slate-200">Conditional</strong>{" "}
          block to assemble the live app preview.
        </p>
      )}

      {ready && files && (
        <SandpackProvider template="react-ts" files={files} theme="dark">
          <SandpackLayout
            style={{
              borderRadius: 8,
              overflow: "hidden",
              minHeight: 240,
              border: "1px solid #1e293b",
            }}
          >
            <SandpackPreview
              showOpenInCodeSandbox={false}
              showRefreshButton
              style={{ height: 240 }}
            />
          </SandpackLayout>
        </SandpackProvider>
      )}
    </Panel>
  );
}
