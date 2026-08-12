import { Button } from "@cogent/ui";
import { AssemblyPreview } from "../assembly/AssemblyPreview";
import { BlockPalette } from "./BlockPalette";
import { BlockWorkspace } from "./BlockWorkspace";
import { PlaygroundCanvas } from "./PlaygroundCanvas";
import { usePlaygroundStore } from "./usePlaygroundStore";

export function PlaygroundPage() {
  const challengeTitle = usePlaygroundStore((state) => state.challengeTitle);
  const challengeDescription = usePlaygroundStore((state) => state.challengeDescription);
  const resetChallenge = usePlaygroundStore((state) => state.resetChallenge);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-800 bg-slate-950/80 px-6 py-4 backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-white">Cogent Playground</h1>
            <p className="text-sm text-slate-400">
              Phase 3 — Sandpack execution, assembly preview, content-driven challenges
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={resetChallenge}>
              Reset challenge
            </Button>
            <span className="rounded-full bg-indigo-950 px-3 py-1 text-xs text-indigo-300">
              {challengeTitle}
            </span>
          </div>
        </div>
        <p className="mt-2 text-sm text-slate-500">{challengeDescription}</p>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-[260px_1fr_400px] gap-4 p-4">
        <BlockPalette />

        <div className="flex min-h-0 flex-col gap-4">
          <section className="relative min-h-[340px] flex-1 overflow-hidden rounded-xl border border-slate-800 bg-slate-950/40">
            <PlaygroundCanvas />
          </section>
          <AssemblyPreview />
        </div>

        <BlockWorkspace />
      </main>
    </div>
  );
}
