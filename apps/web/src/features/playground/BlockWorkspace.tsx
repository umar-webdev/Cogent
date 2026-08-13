import Editor from "@monaco-editor/react";
import { getBlockDefinition } from "@cogent/block-registry";
import { Badge, Button, Panel } from "@cogent/ui";
import { BlockIcon } from "../blocks/BlockIcon";
import { SandpackRunner } from "../execution/SandpackRunner";
import { runBlock } from "../execution/runBlock";
import { transitionBlockStatus } from "../execution/blockStateMachine";
import { TestResultsPanel } from "./TestResultsPanel";
import {
  usePlaygroundStore,
} from "./usePlaygroundStore";
import {
  INPUT_FIELD_TYPES,
  inputFieldTypeLabel,
  normalizeInputFieldType,
} from "./inputFieldTypes";

const SANDBOX_CANVAS_ONLY_BLOCKS = new Set(["input.v1", "button.v1", "text.v1"]);

export function BlockWorkspace() {
  const selectedNodeId = usePlaygroundStore((state) => state.selectedNodeId);
  const selectedNode = usePlaygroundStore((state) =>
    state.selectedNodeId
      ? state.nodes.find((node) => node.id === state.selectedNodeId)
      : undefined,
  );
  const code = usePlaygroundStore((state) =>
    state.selectedNodeId ? (state.codeByNodeId[state.selectedNodeId] ?? "") : "",
  );
  const setNodeCode = usePlaygroundStore((state) => state.setNodeCode);
  const setNodeLabel = usePlaygroundStore((state) => state.setNodeLabel);
  const setNodeFieldType = usePlaygroundStore((state) => state.setNodeFieldType);
  const setNodeStatus = usePlaygroundStore((state) => state.setNodeStatus);
  const setGradingResult = usePlaygroundStore((state) => state.setGradingResult);
  const gradingResult = usePlaygroundStore((state) => state.gradingResult);
  const getTestsForSelectedBlock = usePlaygroundStore(
    (state) => state.getTestsForSelectedBlock,
  );
  const implementHint = usePlaygroundStore((state) => state.implementHint);
  const assemblyKind = usePlaygroundStore((state) => state.assemblyKind);
  const focusBlockId = usePlaygroundStore((state) => state.activeChallenge.focusBlockId);

  const isSandbox = assemblyKind === "sandbox";

  if (!selectedNode) {
    return (
      <Panel title="Block editor" className="h-full">
        <p className="text-sm text-slate-400">
          Click a block on the canvas to configure or edit its implementation.
        </p>
      </Panel>
    );
  }

  const definition = getBlockDefinition(selectedNode.data.blockId);
  const testCases = getTestsForSelectedBlock();
  const hasTests = testCases.length > 0;
  const usesGenericValidatorTests =
    isSandbox &&
    selectedNode?.data.blockId === "validator.v1" &&
    testCases.some((test) => test.match === "partial" || test.match === "validator_shape");
  const testsPassed = gradingResult?.pass === true;
  const isCanvasOnly =
    isSandbox && SANDBOX_CANVAS_ONLY_BLOCKS.has(selectedNode.data.blockId);

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
            hint: isCanvasOnly
              ? "This block is configured on the canvas — no code tests needed."
              : "This block has no challenge tests yet.",
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

  if (isCanvasOnly) {
    return (
      <div className="flex h-full flex-col gap-4 overflow-auto">
        <Panel
          title={
            <span className="flex items-center gap-2">
              <BlockIcon name={definition.icon} size={18} />
              {selectedNode.data.blockId === "input.v1"
                ? selectedNode.data.label || "New field"
                : definition.label}
            </span>
          }
        >
          {selectedNode.data.blockId === "input.v1" ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-400">
                Configure the field here. The label is the key in{" "}
                <code className="text-slate-300">formatForm(fields)</code>. The type controls the
                HTML input in the preview. Wire a <strong className="text-slate-300">Validator</strong>{" "}
                block to this input and write your own rules (length, regex, email, password, etc.).
              </p>
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Field label
                </span>
                <input
                  type="text"
                  value={selectedNode.data.label}
                  onChange={(event) => setNodeLabel(selectedNode.id, event.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                  placeholder="e.g. Phone, Password, Username"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Field type
                </span>
                <select
                  value={normalizeInputFieldType(selectedNode.data.fieldType)}
                  onChange={(event) =>
                    setNodeFieldType(
                      selectedNode.id,
                      normalizeInputFieldType(event.target.value),
                    )
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                >
                  {INPUT_FIELD_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500">
                  {
                    INPUT_FIELD_TYPES.find(
                      (type) => type.id === normalizeInputFieldType(selectedNode.data.fieldType),
                    )?.description
                  }
                </p>
              </label>
              <p className="text-xs text-slate-500">
                Optional: Input → Validator → Formatter. Validation is never auto-filled — you code
                it in the Validator block.
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              This block shapes your architecture on the canvas. The assembly preview reads your
              wiring — rename labels on Input blocks and implement Validator / Formatter code.
            </p>
          )}
        </Panel>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto">
      <Panel
        title={
          <span className="flex items-center gap-2">
            <BlockIcon name={definition.icon} size={18} />
            {selectedNode.data.label || definition.label}
          </span>
        }
        className="min-h-0 shrink-0"
        action={
          hasTests ? (
            <Button onClick={handleRunTests} disabled={!code.trim()}>
              Run tests
            </Button>
          ) : null
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
            key={selectedNodeId}
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
        {hasTests && usesGenericValidatorTests && (
          <p className="mt-3 text-xs text-slate-500">
            Custom validator — you write all rules. For phone fields use{" "}
            <code className="text-slate-400">/^[6-9]\d{"{9}"}$/</code> on digits only (must start
            with 6–9). Example:{" "}
            <code className="text-slate-400">const digits = value.replace(/\D/g, &quot;&quot;)</code>
            . Tests only check return shape; use Assembly preview to verify.
          </p>
        )}
        {hasTests &&
          isSandbox &&
          selectedNode.data.blockId === "validator.v1" &&
          !usesGenericValidatorTests && (
            <p className="mt-3 text-xs text-slate-500">
              Starter email demo tests apply only to this block. Change the code for your field.
            </p>
          )}
        {hasTests && !usesGenericValidatorTests && (
          <p className="mt-3 text-xs text-slate-500">{implementHint}</p>
        )}
        {!hasTests && isSandbox && (
          <p className="mt-3 text-xs text-slate-500">
            Write your own logic, then try it in the assembly preview.
          </p>
        )}
      </Panel>

      <TestResultsPanel result={gradingResult} className="min-h-0 shrink-0" />

      {(testsPassed || isSandbox) &&
        (selectedNode.data.blockId === "formatter.v1" ||
          selectedNode.data.blockId === "validator.v1" ||
          (!isSandbox && selectedNode.data.blockId === focusBlockId && testsPassed)) && (
          <Panel title="Block preview (Sandpack)" className="min-h-0 shrink-0">
            <SandpackRunner
              code={code}
              stub={definition.contract.stub}
              modulePath="/blocks/preview.ts"
            />
          </Panel>
        )}
    </div>
  );
}
