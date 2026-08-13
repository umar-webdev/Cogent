import type { NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import { Badge } from "@cogent/ui";
import { BlockIcon } from "../blocks/BlockIcon";
import type { CanvasBlockNode } from "./usePlaygroundStore";
import { inputFieldTypeLabel, normalizeInputFieldType } from "./inputFieldTypes";

const statusTone = {
  untouched: "warning",
  implemented: "success",
  error: "error",
} as const;

const statusLabel = {
  untouched: "To do",
  implemented: "Done",
  error: "Error",
} as const;

export function BlockNode({ data, selected }: NodeProps<CanvasBlockNode>) {
  return (
    <div
      className={`min-w-[140px] rounded-xl border bg-slate-900 px-3 py-3 shadow-lg transition ${
        selected ? "border-indigo-400 ring-2 ring-indigo-500/40" : "border-slate-700"
      }`}
    >
      <Handle type="target" position={Position.Left} className="!bg-indigo-400" />
      <div className="flex items-center gap-2">
        <BlockIcon name={data.icon} size={22} className="shrink-0 text-indigo-400" />
        <div>
          <p className="text-sm font-semibold text-slate-100">{data.label}</p>
          <p className="text-[10px] uppercase tracking-wide text-slate-500">
            {data.blockId === "input.v1"
              ? inputFieldTypeLabel(normalizeInputFieldType(data.fieldType))
              : data.blockId}
          </p>
        </div>
      </div>
      <div className="mt-2">
        <Badge tone={statusTone[data.status]}>{statusLabel[data.status]}</Badge>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-indigo-400" />
    </div>
  );
}
