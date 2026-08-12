import { conditionalContract } from "@cogent/contracts";
import { exportBlockCode } from "@cogent/grading-engine";
import type { CanvasBlockNode } from "../playground/usePlaygroundStore";

type AssemblyInput = {
  nodes: CanvasBlockNode[];
  codeByNodeId: Record<string, string>;
};

export function compileIsEvenAssembly({
  nodes,
  codeByNodeId,
}: AssemblyInput): Record<string, string> | null {
  const conditionalNode = nodes.find(
    (node) =>
      node.data.blockId === "conditional.v1" && node.data.status === "implemented",
  );

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
      <p style={{ color: "#64748b", fontSize: 14 }}>
        Assembled from your implemented blocks.
      </p>
      <label style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Enter a number</span>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.valueAsNumber || 0)}
          style={{
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid #cbd5e1",
            fontSize: 16,
          }}
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

export function canAssemble(nodes: CanvasBlockNode[]): boolean {
  return nodes.some(
    (node) => node.data.blockId === "conditional.v1" && node.data.status === "implemented",
  );
}
