import Editor from "@monaco-editor/react";
import { getBlockDefinition } from "@cogent/block-registry";
import { Badge, Button, Panel } from "@cogent/ui";
import { SandpackRunner } from "../execution/SandpackRunner";
import { runBlock } from "../execution/runBlock";
import { transitionBlockStatus } from "../execution/blockStateMachine";
import { TestResultsPanel } from "./TestResultsPanel";
import {
  getSelectedCode,
  getSelectedNode,
  usePlaygroundStore,
} from "./usePlaygroundStore";

export function BlockWorkspace() {
  const selectedNode = usePlaygroundStore(getSelectedNode);
  const code = usePlaygroundStore(getSelectedCode);
  const setNodeCode = usePlaygroundStore((state) => state.setNodeCode);
  const setNodeStatus = usePlaygroundStore((state) => state.setNodeStatus);
  const setGradingResult = usePlaygroundStore((state) => state.setGradingResult);
  const gradingResult = usePlaygroundStore((state) => state.gradingResult);
  const getTestsForSelectedBlock = usePlaygroundStore(
    (state) => state.getTestsForSelectedBlock,
  );

  if (!selectedNode) {
    return (
      <Panel title="Block editor" className="h-full">
        <p className="text-sm text-slate-400">
          Click a block on the canvas to edit its implementation.
        </p>
      </Panel>
    );
  }

  const definition = getBlockDefinition(selectedNode.data.blockId);
  const testCases = getTestsForSelectedBlock();
  const hasTests = testCases.length > 0;
  const testsPassed = gradingResult?.pass === true;

  async function handleRunTests() {
    if (!selectedNode) return;

    if (!hasTests) {
      setGradingResult({
        pass: false,
        results: [
          {
            name: "No tests defined",
            pass: false,
            expected: "—",
            received: "—",
            hint: "This block has no challenge tests yet.",
          },
        ],
        hints: [],
      });
      return;
    }

    const { ok, grading } = await runBlock(definition.contract, code, testCases);
    setGradingResult(grading);
    setNodeStatus(
      selectedNode.id,
      transitionBlockStatus(
        selectedNode.data.status,
        ok ? "tests_passed" : "tests_failed",
      ),
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto">
      <Panel
        title={`${definition.icon} ${definition.label}`}
        className="min-h-0 shrink-0"
        action={
          <Button onClick={handleRunTests} disabled={!code.trim() || !hasTests}>
            Run tests
          </Button>
        }
      >
        <div className="mb-3 flex flex-wrap gap-2">
          {Object.entries(definition.contract.inputs).map(([name, port]) => (
            <Badge key={name} tone="neutral">
              in {name}: {port.type}
            </Badge>
          ))}
          {Object.entries(definition.contract.outputs).map(([name, port]) => (
            <Badge key={name} tone="neutral">
              out {name}: {port.type}
            </Badge>
          ))}
        </div>
        <div className="h-[220px] overflow-hidden rounded-lg border border-slate-800">
          <Editor
            height="100%"
            defaultLanguage="typescript"
            value={code}
            onChange={(value) => setNodeCode(selectedNode.id, value ?? "")}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              padding: { top: 12 },
            }}
          />
        </div>
        {hasTests && (
          <p className="mt-3 text-xs text-slate-500">
            Implement <code className="text-indigo-300">checkValue</code> so even numbers
            return <code className="text-indigo-300">true</code>.
          </p>
        )}
      </Panel>

      <TestResultsPanel result={gradingResult} className="min-h-0 shrink-0" />

      {testsPassed && selectedNode.data.blockId === "conditional.v1" && (
        <Panel title="Block preview (Sandpack)" className="min-h-0 shrink-0">
          <SandpackRunner code={code} stub={definition.contract.stub} />
        </Panel>
      )}
    </div>
  );
}
