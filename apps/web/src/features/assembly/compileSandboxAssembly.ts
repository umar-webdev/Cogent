import { formatterContract, validatorContract } from "@cogent/contracts";
import { exportBlockCode } from "@cogent/grading-engine";
import type { CanvasBlockNode } from "../playground/usePlaygroundStore";
import { normalizeInputFieldType, type InputFieldType } from "../playground/inputFieldTypes";

export type SandboxField = {
  key: string;
  inputType: InputFieldType;
  inputId: string;
  validatorId: string | null;
  validatorImport: string | null;
};

export type SandboxGraph = {
  inputs: CanvasBlockNode[];
  formatter: CanvasBlockNode | undefined;
  outputLabel: string;
  fields: SandboxField[];
  validatorIds: string[];
};

function findNode(nodes: CanvasBlockNode[], blockId: CanvasBlockNode["data"]["blockId"]) {
  return nodes.find((node) => node.data.blockId === blockId);
}

export function analyzeSandboxGraph(
  nodes: CanvasBlockNode[],
  edges: { source: string; target: string }[],
): SandboxGraph {
  const inputs = nodes.filter((node) => node.data.blockId === "input.v1");
  const formatter = findNode(nodes, "formatter.v1");
  const textNode = findNode(nodes, "text.v1");

  const validationByInputId = new Map<string, string>();
  for (const edge of edges) {
    const source = nodes.find((node) => node.id === edge.source);
    const target = nodes.find((node) => node.id === edge.target);
    if (source?.data.blockId === "input.v1" && target?.data.blockId === "validator.v1") {
      validationByInputId.set(source.id, target.id);
    }
  }

  const validatorIds = [
    ...new Set(
      inputs
        .map((input) => validationByInputId.get(input.id))
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const fields: SandboxField[] = inputs.map((input) => {
    const validatorId = validationByInputId.get(input.id) ?? null;
    return {
      key: input.data.label,
      inputType: normalizeInputFieldType(input.data.fieldType),
      inputId: input.id,
      validatorId,
      validatorImport: validatorId ? validatorImportName(validatorId) : null,
    };
  });

  return {
    inputs,
    formatter,
    outputLabel: textNode?.data.label ?? "Output",
    fields,
    validatorIds,
  };
}

function validatorImportName(validatorId: string): string {
  return `validate_${validatorId.replace(/[^a-zA-Z0-9]/g, "_")}`;
}

function escapeJson(value: string): string {
  return JSON.stringify(value);
}

export function compileSandboxAssembly({
  nodes,
  edges,
  codeByNodeId,
}: {
  nodes: CanvasBlockNode[];
  edges: { source: string; target: string }[];
  codeByNodeId: Record<string, string>;
}): Record<string, string> | null {
  const graph = analyzeSandboxGraph(nodes, edges);

  if (graph.inputs.length === 0 || !graph.formatter) {
    return null;
  }

  const formatterCode =
    codeByNodeId[graph.formatter.id] ??
    `function formatForm(fields: Record<string, string>): string {
  return "";
}`;

  const files: Record<string, string> = {
    "/blocks/formatter.ts": exportBlockCode(formatterCode, formatterContract.stub),
  };

  const validatorImports: string[] = [];
  for (const validatorId of graph.validatorIds) {
    const importName = validatorImportName(validatorId);
    const code =
      codeByNodeId[validatorId] ??
      `function validateInput(value: string): { valid: boolean; message: string } {
  if (!value.trim()) {
    return { valid: false, message: "Required." };
  }
  return { valid: true, message: "" };
}`;
    files[`/blocks/validators/${validatorId}.ts`] = exportBlockCode(code, validatorContract.stub);
    validatorImports.push(
      `import { validateInput as ${importName} } from "./blocks/validators/${validatorId}";`,
    );
  }

  const fieldsJson = JSON.stringify(
    graph.fields.map(({ key, inputType, validatorImport }) => ({
      key,
      inputType,
      validatorImport,
    })),
    null,
    2,
  );

  files["/App.tsx"] = `import { useState } from "react";
import { formatForm } from "./blocks/formatter";
${validatorImports.join("\n")}

type FieldConfig = { key: string; inputType: string; validatorImport: string | null };

const FIELDS: FieldConfig[] = ${fieldsJson};

const VALIDATORS: Record<string, (value: string) => { valid: boolean; message: string }> = {
${graph.fields
  .filter((field) => field.validatorImport)
  .map((field) => `  ${escapeJson(field.key)}: ${field.validatorImport},`)
  .join("\n")}
};

/** Strip spaces/dashes from phone fields before your validator runs. */
function valueForValidation(raw: string, inputType: string) {
  if (inputType === "tel") {
    return raw.replace(/\\D/g, "");
  }
  return raw;
}

export default function App() {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(FIELDS.map((field) => [field.key, ""])),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [output, setOutput] = useState("Fill the form and click Submit.");

  function updateField(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};

    for (const field of FIELDS) {
      const raw = values[field.key] ?? "";
      const validator = field.validatorImport ? VALIDATORS[field.key] : null;
      if (validator) {
        const result = validator(valueForValidation(raw, field.inputType));
        if (!result.valid) {
          nextErrors[field.key] = result.message || "Invalid value";
        }
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setOutput("Fix validation errors above.");
      return;
    }

    setOutput(formatForm(values));
  }

  return (
    <div style={{ fontFamily: "system-ui", padding: 24, maxWidth: 480 }}>
      <h1 style={{ marginTop: 0, fontSize: 22 }}>Your form</h1>
      <p style={{ color: "#64748b", fontSize: 14, marginBottom: 16 }}>
        Built from blocks on your canvas — add inputs, validators, and formatter logic.
      </p>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        {FIELDS.map((field) => (
          <label key={field.key} style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{field.key}</span>
            <input
              type={field.inputType}
              inputMode={field.inputType === "tel" ? "numeric" : undefined}
              placeholder={field.inputType === "tel" ? "9876543210" : undefined}
              autoComplete={field.inputType === "tel" ? "tel" : undefined}
              value={values[field.key] ?? ""}
              onChange={(event) => updateField(field.key, event.target.value)}
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                border: errors[field.key] ? "1px solid #ef4444" : "1px solid #cbd5e1",
                fontSize: 16,
              }}
            />
            {errors[field.key] && (
              <span style={{ fontSize: 12, color: "#ef4444" }}>{errors[field.key]}</span>
            )}
            {field.validatorImport && !errors[field.key] && (
              <span style={{ fontSize: 11, color: "#94a3b8" }}>
                {field.inputType === "tel"
                  ? "Validated on submit (spaces/dashes ignored for phone)"
                  : "Validated on submit"}
              </span>
            )}
          </label>
        ))}
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
          Submit
        </button>
      </form>
      <div style={{ marginTop: 20 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>
          ${graph.outputLabel}
        </p>
        <p
          style={{
            padding: 12,
            borderRadius: 8,
            background: "#f1f5f9",
            color: "#0f172a",
            fontSize: 16,
            minHeight: 24,
            margin: 0,
          }}
        >
          {output || "—"}
        </p>
      </div>
    </div>
  );
}`;

  return files;
}

export function canAssembleSandbox(
  nodes: CanvasBlockNode[],
  edges: { source: string; target: string }[],
): boolean {
  const graph = analyzeSandboxGraph(nodes, edges);
  return graph.inputs.length > 0 && Boolean(graph.formatter);
}
