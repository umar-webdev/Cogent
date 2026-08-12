import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import { exportBlockCode } from "@cogent/grading-engine";

type SandpackRunnerProps = {
  code: string;
  stub: string;
  fnName?: string;
};

export function SandpackRunner({ code, stub, fnName = "checkValue" }: SandpackRunnerProps) {
  const blockModule = exportBlockCode(code, stub);

  const files = {
    "/blocks/conditional.ts": blockModule,
    "/App.tsx": `import { ${fnName} } from "./blocks/conditional";

const samples = [4, 3, 0, -2];

export default function App() {
  return (
    <div style={{ fontFamily: "system-ui", padding: 16 }}>
      <h2 style={{ margin: "0 0 12px", fontSize: 16 }}>Block preview</h2>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {samples.map((value) => (
          <li key={value} style={{ marginBottom: 6 }}>
            {fnName}({value}) → <strong>{String(${fnName}(value))}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}`,
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
