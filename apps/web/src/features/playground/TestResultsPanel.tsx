import type { GradingResult } from "@cogent/grading-engine";
import { Badge, Panel } from "@cogent/ui";

type TestResultsPanelProps = {
  result: GradingResult | null;
  className?: string;
};

export function TestResultsPanel({ result, className }: TestResultsPanelProps) {
  return (
    <Panel
      title="Test results"
      className={className}
      action={
        result ? (
          <Badge tone={result.pass ? "success" : "error"}>
            {result.pass ? "All passed" : "Some failed"}
          </Badge>
        ) : null
      }
    >
      {!result && (
        <p className="text-sm text-slate-400">
          Run tests to see scoped feedback for this block.
        </p>
      )}

      {result && (
        <ul className="space-y-3">
          {result.results.map((test) => (
            <li
              key={test.name}
              className="rounded-lg border border-slate-800 bg-slate-950/50 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-slate-100">{test.name}</span>
                <Badge tone={test.pass ? "success" : "error"}>
                  {test.pass ? "Pass" : "Fail"}
                </Badge>
              </div>
              {!test.pass && (
                <dl className="mt-2 space-y-1 text-xs text-slate-400">
                  <div className="flex gap-2">
                    <dt className="text-slate-500">Expected:</dt>
                    <dd className="text-slate-200">{String(test.expected)}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-slate-500">Received:</dt>
                    <dd className="text-slate-200">{String(test.received)}</dd>
                  </div>
                  {test.hint && (
                    <p className="mt-2 rounded-md bg-indigo-950/40 p-2 text-indigo-200">
                      💡 {test.hint}
                    </p>
                  )}
                </dl>
              )}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
