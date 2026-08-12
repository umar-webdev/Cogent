import { BLOCK_CATEGORIES, listBlocksByCategory } from "@cogent/block-registry";
import { Panel } from "@cogent/ui";
import { usePlaygroundStore } from "./usePlaygroundStore";

export function BlockPalette() {
  const addBlockToCanvas = usePlaygroundStore((state) => state.addBlockToCanvas);

  return (
    <Panel title="Block library" className="h-full">
      <div className="space-y-5">
        {BLOCK_CATEGORIES.map((category) => {
          const blocks = listBlocksByCategory(category.id);
          return (
            <div key={category.id}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {category.label}
              </h3>
              <ul className="space-y-2">
                {blocks.map((block) => (
                  <li key={block.id}>
                    <button
                      type="button"
                      onClick={() => addBlockToCanvas(block.id)}
                      className="flex w-full items-start gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-left transition hover:border-indigo-500/50 hover:bg-slate-900"
                    >
                      <span className="text-xl">{block.icon}</span>
                      <span>
                        <span className="block text-sm font-medium text-slate-100">
                          {block.label}
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-400">
                          {block.description}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
