import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import { exportBlockCode, extractFunctionName } from "@cogent/grading-engine";

type SandpackRunnerProps = {
  code: string;
  stub: string;
  modulePath?: string;
};

function buildPreviewApp(fnName: string): string {
  if (fnName === "formatForm") {
    return `import { ${fnName} } from "./blocks/preview";

const samples = [
  { Name: "Alex", Email: "alex@example.com" },
  { "First name": "Jane", "Last name": "Doe" },
];

export default function App() {
  return (
    <div style={{ fontFamily: "system-ui", padding: 16 }}>
      <h2 style={{ margin: "0 0 12px", fontSize: 16 }}>Block preview</h2>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {samples.map((fields, index) => (
          <li key={index} style={{ marginBottom: 6 }}>
            ${fnName}(fields) → <strong>{String(${fnName}(fields))}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}`;
  }

  if (fnName === "validateInput") {
    return `import { ${fnName} } from "./blocks/preview";

const samples = ["", "bad", "good-value"];

export default function App() {
  return (
    <div style={{ fontFamily: "system-ui", padding: 16 }}>
      <h2 style={{ margin: "0 0 12px", fontSize: 16 }}>Block preview</h2>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {samples.map((value) => {
          const result = ${fnName}(value);
          return (
            <li key={value || "(empty)"} style={{ marginBottom: 6 }}>
              "{value}" → {result.valid ? "valid" : result.message}
            </li>
          );
        })}
      </ul>
    </div>
  );
}`;
  }

  return `import { ${fnName} } from "./blocks/preview";

const samples = [4, 3, 0, -2];

export default function App() {
  return (
    <div style={{ fontFamily: "system-ui", padding: 16 }}>
      <h2 style={{ margin: "0 0 12px", fontSize: 16 }}>Block preview</h2>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {samples.map((value) => (
          <li key={value} style={{ marginBottom: 6 }}>
            ${fnName}({value}) → <strong>{String(${fnName}(value))}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}`;
}

export function SandpackRunner({
  code,
  stub,
  modulePath = "/blocks/preview.ts",
}: SandpackRunnerProps) {
  const fnName = extractFunctionName(stub);
  const blockModule = exportBlockCode(code, stub);

  const files = {
    [modulePath]: blockModule,
    "/App.tsx": buildPreviewApp(fnName),
  };

  return (
    <SandpackProvider template="react-ts" files={files} theme="dark">
      <SandpackLayout style={{ borderRadius: 8, overflow: "hidden", minHeight: 220 }}>
        <SandpackCodeEditor showTabs={false} showLineNumbers={false} />
        <SandpackPreview showOpenInCodeSandbox={false} showRefreshButton={false} />
      </SandpackLayout>
    </SandpackProvider>
  );
}
