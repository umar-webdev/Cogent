import { CHALLENGES } from "@cogent/content";
import { usePlaygroundStore } from "./usePlaygroundStore";

export function ChallengePicker() {
  const challengeId = usePlaygroundStore((state) => state.challengeId);
  const loadChallenge = usePlaygroundStore((state) => state.loadChallenge);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {CHALLENGES.map((challenge) => {
        const active = challenge.id === challengeId;
        return (
          <button
            key={challenge.id}
            type="button"
            aria-pressed={active}
            onClick={() => {
              if (challenge.id !== challengeId) {
                loadChallenge(challenge.id);
              }
            }}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              active
                ? "bg-indigo-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {challenge.title}
          </button>
        );
      })}
    </div>
  );
}
