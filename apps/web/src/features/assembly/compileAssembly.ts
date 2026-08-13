import { conditionalContract, formatterContract } from "@cogent/contracts";
import { exportBlockCode } from "@cogent/grading-engine";
import type { AssemblyKind } from "@cogent/content";
import type { Edge } from "@xyflow/react";
import type { CanvasBlockNode } from "../playground/usePlaygroundStore";
import { canAssembleSandbox, compileSandboxAssembly } from "./compileSandboxAssembly";

type AssemblyInput = {
  nodes: CanvasBlockNode[];
  edges: Edge[];
  codeByNodeId: Record<string, string>;
  assemblyKind: AssemblyKind;
};

function findImplementedNode(
  nodes: CanvasBlockNode[],
  blockId: CanvasBlockNode["data"]["blockId"],
) {
  return nodes.find(
    (node) => node.data.blockId === blockId && node.data.status === "implemented",
  );
}

function findNode(nodes: CanvasBlockNode[], blockId: CanvasBlockNode["data"]["blockId"]) {
  return nodes.find((node) => node.data.blockId === blockId);
}

export function compileIsEvenAssembly({
  nodes,
  codeByNodeId,
}: Omit<AssemblyInput, "assemblyKind">): Record<string, string> | null {
  const conditionalNode = findImplementedNode(nodes, "conditional.v1");
  if (!conditionalNode) return null;

  const code = codeByNodeId[conditionalNode.id];
  if (!code) return null;

  const blockModule = exportBlockCode(code, conditionalContract.stub);

  return {
    "/blocks/conditional.ts": blockModule,
    "/App.tsx": `import { useState } from "react";
import { checkValue } from "./blocks/conditional";

export default function App() {
  const [value, setValue] = useState(4);
  const isEven = checkValue(Number(value));

  return (
    <div style={{ fontFamily: "system-ui", padding: 24, maxWidth: 360 }}>
      <h1 style={{ marginTop: 0, fontSize: 22 }}>Is Even?</h1>
      <p style={{ color: "#64748b", fontSize: 14 }}>Assembled from your implemented blocks.</p>
      <label style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Enter a number</span>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.valueAsNumber || 0)}
          style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 16 }}
        />
      </label>
      <p style={{ marginTop: 20, fontSize: 18, fontWeight: 600 }}>
        {isEven ? "✅ Even" : "❌ Odd"}
      </p>
    </div>
  );
}`,
  };
}

export function compileGreetingFormAssembly({
  nodes,
  codeByNodeId,
}: Omit<AssemblyInput, "assemblyKind">): Record<string, string> | null {
  const formatterNode = findNode(nodes, "formatter.v1");
  if (!formatterNode) return null;

  const code =
    codeByNodeId[formatterNode.id] ??
    `function formatForm(fields: Record<string, string>): string {
  return "";
}`;

  const blockModule = exportBlockCode(code, formatterContract.stub);

  return {
    "/blocks/formatter.ts": blockModule,
    "/App.tsx": `import { useState } from "react";
import { formatForm } from "./blocks/formatter";

export default function App() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [message, setMessage] = useState("Fill the form and click Show greeting");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage(
      formatForm({ "First name": firstName, "Last name": lastName }),
    );
  }

  return (
    <div style={{ fontFamily: "system-ui", padding: 24, maxWidth: 420 }}>
      <h1 style={{ marginTop: 0, fontSize: 22 }}>Greeting Form</h1>
      <p style={{ color: "#64748b", fontSize: 14, marginBottom: 16 }}>
        First name + Last name → Formatter → Text
      </p>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>First name</span>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Jane"
            style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 16 }}
          />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Last name</span>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
            style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 16 }}
          />
        </label>
        <button
          type="submit"
          style={{
            marginTop: 4,
            padding: "10px 14px",
            borderRadius: 8,
            border: "none",
            background: "#4f46e5",
            color: "white",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Show greeting
        </button>
      </form>
      <p
        style={{
          marginTop: 20,
          padding: 12,
          borderRadius: 8,
          background: "#f1f5f9",
          color: "#0f172a",
          fontSize: 16,
          minHeight: 24,
        }}
      >
        {message || "—"}
      </p>
    </div>
  );
}`,
  };
}

export function compileAssembly(input: AssemblyInput): Record<string, string> | null {
  switch (input.assemblyKind) {
    case "sandbox":
      return compileSandboxAssembly(input);
    case "greeting-form":
      return compileGreetingFormAssembly(input);
    case "is-even":
    default:
      return compileIsEvenAssembly(input);
  }
}

export function canAssemble(
  nodes: CanvasBlockNode[],
  edges: Edge[],
  assemblyKind: AssemblyKind,
  previewAlways = false,
): boolean {
  if (assemblyKind === "sandbox") {
    return canAssembleSandbox(nodes, edges);
  }
  if (previewAlways) return true;
  switch (assemblyKind) {
    case "greeting-form":
      return Boolean(findImplementedNode(nodes, "formatter.v1"));
    case "is-even":
    default:
      return Boolean(findImplementedNode(nodes, "conditional.v1"));
  }
}
