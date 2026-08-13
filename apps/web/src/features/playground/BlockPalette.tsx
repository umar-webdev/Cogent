import { BLOCK_CATEGORIES, listBlocksByCategory } from "@cogent/block-registry";
import { BlockIcon } from "../blocks/BlockIcon";
import { usePlaygroundStore } from "./usePlaygroundStore";

export function BlockPalette() {
  const addBlockToCanvas = usePlaygroundStore((state) => state.addBlockToCanvas);

  return (
    <nav
      aria-label="Block library"
      className="-mx-6 mt-3 border-t border-slate-800 bg-slate-950/60 px-6 py-2.5"
    >
      <div className="block-library-scroll flex items-center gap-3 overflow-x-auto">
        {BLOCK_CATEGORIES.map((category, categoryIndex) => {
          const blocks = listBlocksByCategory(category.id);
          return (
            <div key={category.id} className="flex shrink-0 items-center gap-2">
              {categoryIndex > 0 && (
                <div
                  className="mx-1 h-7 w-px shrink-0 bg-slate-700"
                  aria-hidden
                />
              )}
              <span className="shrink-0 pr-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {category.label}
              </span>
              <ul className="flex items-center gap-2">
                {blocks.map((block) => (
                  <li key={block.id} className="shrink-0">
                    <button
                      type="button"
                      title={block.description}
                      onClick={() => addBlockToCanvas(block.id)}
                      className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-left transition hover:border-indigo-500/50 hover:bg-slate-800"
                    >
                      <BlockIcon
                        name={block.icon}
                        size={18}
                        className="shrink-0 text-indigo-400"
                      />
                      <span className="whitespace-nowrap text-xs font-medium text-slate-100">
                        {block.label}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
