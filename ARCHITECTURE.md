# Architecture Guide — v1 / MVP (Block-Based Learning Playground)

This document explains **how to structure the codebase for v1**, and *why* — folder by
folder, file by file — so that v2 (bug-finding), v3 (backend execution), v4, and v5
(fullstack merge) are additive instead of rewrites. It follows directly from
`project-spec.md` §3, §6, §7: the block/contract schema is the single source of truth,
and v1 must stay 100% client-side while still leaving room for accounts, content, and
progress to live server-side from day one.

> **Read this before writing code.** Every folder below exists to answer one question:
> *"if this were suddenly 50x bigger, would this decision still make sense?"* If the
> answer is no, the folder doesn't belong in v1.

---

## 1. Guiding architectural decisions (and why)

| Decision | Why |
|---|---|
| **Monorepo** (pnpm workspaces + Turborepo) | The block **contract schema** must be shared, unmodified, between the canvas UI, the grading/validation logic, and (later) the backend runtime. A monorepo with a shared `packages/contracts` is the only way to guarantee "one source of truth" (spec §7) without publishing/versioning an npm package on every change. |
| **TypeScript everywhere, `strict: true`** | Block contracts are literally TS interfaces (spec §2). If the app isn't strict-mode TS, contract violations silently pass instead of failing at compile time — which defeats the entire pedagogical premise ("teach structure via types"). |
| **Contracts as runtime schemas (Zod), not just types** | TS types vanish at runtime. But grading has to validate *user-submitted, untrusted* block code at runtime (e.g., "does this function actually return a boolean?"). Zod schemas give you the runtime check **and** `z.infer<>` derives the TS type from it — so you define the contract once, not twice. |
| **Client-only execution for v1** (Sandpack) | Per spec §6/§7, v1 must ship as a static, cheap-to-host app with zero execution infra. A backend sandbox (Judge0/E2B) is a v3 concern. Building it now is premature complexity. |
| **A real (if thin) backend from day one** | Spec §6 backend table + §4 Phase 3 ("save/resume, lightweight auth") means v1 *does* need an API + Postgres for accounts/progress — just not for *code execution*. Keeping this backend thin (tRPC CRUD only) avoids the trap of building v3's sandbox early while still avoiding a painful "add a backend later" migration. |
| **Feature-based folders inside each app, not type-based** | `components/`, `hooks/`, `utils/` at the root of a large app becomes unnavigable past ~20 files. Grouping by feature (`canvas/`, `block-editor/`, `assembly/`) keeps each block-system concern (spec §2 steps 1–5) self-contained and independently testable. |
| **`type: 'frontend' \| 'backend'` on the block contract from v1** | Directly mandated by spec §3: "design the block/contract schema in v1 to also support a `type: backend` block even though the backend runtime doesn't exist yet." This is the single most important schema decision in the whole project — get it wrong and v5 becomes a rebuild. |

---

## 2. Top-level repository layout

```
playground/
├── apps/
│   ├── web/                     # v1/v2 frontend — React + Vite + React Flow + Monaco + Sandpack
│   └── api/                     # thin backend — auth, content, progress (NOT code execution)
├── packages/
│   ├── contracts/                # THE shared source of truth: block contract schemas (Zod + TS)
│   ├── block-registry/           # catalog of block *definitions* (Button, Input, Conditional…)
│   ├── grading-engine/           # pure functions: run block code against contract tests
│   ├── ui/                       # shared design-system components (buttons, panels, badges)
│   ├── canvas-kit/                # React Flow wrapper: node/edge types shared by web app
│   ├── config/                   # shared eslint/tsconfig/tailwind/prettier configs
│   └── db/                       # Drizzle ORM schema + typed client (used only by apps/api)
├── content/
│   └── tracks/                   # challenge content as data (JSON/TS), not code — see §5
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── tsconfig.base.json
```

**Why `apps/` vs `packages/` vs `content/`?**
- `apps/*` — things that **deploy** (a website, a server). Nothing else should import *from* an app; apps only import *from* packages.
- `packages/*` — things that are **imported**, never deployed on their own. This is where all reusable, testable logic lives, and it's what keeps v2/v5 "additive."
- `content/*` — **data, not code.** Challenges/tracks change constantly and are authored by non-engineers eventually (spec §4 Phase 2/3). Keeping them out of `packages` means a content update never requires a code review of `grading-engine`.

---

## 3. `packages/contracts/` — the most important folder in the repo

```
packages/contracts/
├── src/
│   ├── block-base.schema.ts      # shared fields every block contract extends
│   ├── frontend/
│   │   ├── button.contract.ts
│   │   ├── input.contract.ts
│   │   ├── conditional.contract.ts
│   │   ├── loop.contract.ts
│   │   └── state.contract.ts
│   ├── backend/                  # EMPTY in v1 except the base shape — see below
│   │   └── .gitkeep
│   ├── connection-rules.ts       # which block types may legally connect to which
│   └── index.ts                  # barrel export — this is what everything else imports
├── package.json
└── tsconfig.json
```

**Why this exists / how to use it:**

- **`block-base.schema.ts`** defines the shape every block contract must have, including
  the field the whole roadmap hinges on:

  ```ts
  import { z } from "zod";

  export const BlockKindSchema = z.enum(["frontend", "backend"]); // spec §3
  export type BlockKind = z.infer<typeof BlockKindSchema>;

  export const BlockContractBaseSchema = z.object({
    id: z.string(),               // e.g. "button.v1"
    kind: BlockKindSchema,        // "frontend" now; "backend" reserved, unused until v3
    label: z.string(),
    inputs: z.record(z.string(), z.unknown()),   // narrowed per-block below
    outputs: z.record(z.string(), z.unknown()),
    stub: z.string(),             // the pre-filled function body shown in Monaco (spec §5)
  });
  ```

  Every concrete block (e.g. `button.contract.ts`) does `BlockContractBaseSchema.extend({...})`.
  This is *why* v5 is a merge, not a rebuild: `kind: "backend"` already exists as a valid
  value on day one, so `packages/contracts/src/backend/*` simply gets populated in v3
  without touching a single frontend contract or any code that imports `BlockKindSchema`.

- **Zod, not hand-written interfaces.** `z.infer<typeof ButtonContract>` gives you the
  TS type for free, and the same schema does `ButtonContract.safeParse(userSubmission)`
  at grading time. One definition, two jobs — no drift between "what TS thinks the shape
  is" and "what we actually validate."

- **`connection-rules.ts`** encodes the flaw-detection logic from spec §2 ("flag if a
  frontend block is wired straight to a DB block"). Because it lives in `contracts`
  rather than inside the canvas app, both the canvas UI (real-time warning) and a
  future CI/grading pass (v2 "hiring" rubric, spec §8) can reuse the exact same rule.

---

## 4. `apps/web/` — the v1/v2 frontend

```
apps/web/
├── src/
│   ├── features/
│   │   ├── canvas/
│   │   │   ├── CanvasView.tsx          # React Flow root (drag/drop, wiring, save/load)
│   │   │   ├── nodes/                  # custom React Flow node renderers per block kind
│   │   │   ├── useCanvasStore.ts       # Zustand store: nodes, edges, selection, history
│   │   │   └── persistence.ts          # (de)serialize canvas <-> JSON for save/resume
│   │   ├── block-editor/
│   │   │   ├── BlockEditorPanel.tsx    # the "click a block" scoped Monaco panel
│   │   │   ├── MonacoHost.tsx          # Monaco setup: TS language service, types injected
│   │   │   ├── stubGenerator.ts        # builds pre-filled function stub from the contract
│   │   │   └── contextHints.tsx        # read-only "what this block receives/calls" panel
│   │   ├── execution/
│   │   │   ├── SandpackRunner.tsx      # runs one block's code in isolation (spec §2 step 4)
│   │   │   └── blockStateMachine.ts    # untouched -> implemented -> error, per block
│   │   ├── assembly/
│   │   │   └── AssemblyPreview.tsx     # compiles implemented blocks into one live preview
│   │   ├── tracks/                     # track list, challenge list, progress UI (Phase 2)
│   │   └── auth/                       # thin: Clerk/Auth.js wrapper components (Phase 3)
│   ├── shared/
│   │   ├── components/                 # app-specific composites (not generic enough for packages/ui)
│   │   ├── hooks/
│   │   └── lib/
│   │       └── trpc.ts                 # typed API client — see §6
│   ├── app/
│   │   ├── routes/                     # route components (e.g. via TanStack Router)
│   │   └── providers.tsx               # QueryClient, ThemeProvider, AuthProvider composition
│   └── main.tsx
├── index.html
├── vite.config.ts
└── tsconfig.json
```

**Why `features/` and not `components/` + `hooks/` at the top level?**
Each feature folder maps 1:1 to a step in the core interaction loop (spec §2: Plan → Click → Implement → Run → Assemble). A new engineer can open `features/block-editor/` and see everything related to "click a block" in one place, instead of hunting across a global `components/` folder for pieces of five different concerns.

**Why is `execution/` separate from `block-editor/`?**
Because in v3 this folder's *contents* change completely (Sandpack → calling a real backend sandbox), while `block-editor/` (the Monaco panel, stub generation) barely changes. Isolating "how code actually runs" behind a small interface (`runBlock(contract, code): Result`) means v3 can swap the implementation without touching the editor or canvas at all.

**Why does `block-editor/` import from `packages/contracts` instead of defining its own stub logic?**
`stubGenerator.ts` reads `contract.stub` and `contract.inputs` directly from the shared contract package. If stub generation lived only in the frontend, the grading engine (`packages/grading-engine`) would need its own copy of "what does a fresh Button block look like" — a second source of truth, exactly what spec §7 says to avoid.

---

## 5. `content/tracks/` — challenges as data

```
content/tracks/
├── conditionals/
│   ├── track.meta.ts             # title, description, difficulty ramp order
│   └── challenges/
│       ├── 01-is-even.canvas.json      # pre-populated skeleton canvas (spec §4 Phase 2)
│       └── 01-is-even.tests.ts         # contract-based grading tests for this challenge
├── loops/
└── component-basics/
```

**Why content is data, not TypeScript components:** challenges are authored/edited far more often than the engine itself, by people who may not be engineers (content team, per roadmap). A `.canvas.json` file (the exact serialized shape `persistence.ts` produces) can be validated against `packages/contracts` in CI without anyone touching `apps/web`. This also directly enables spec §4 Phase 4 (v2 bug-finding): a "flawed" challenge is just a canvas JSON where the stub has been replaced with broken code — no new engine code required, exactly as the spec calls out.

---

## 6. `apps/api/` — the thin v1 backend

```
apps/api/
├── src/
│   ├── routers/
│   │   ├── auth.router.ts        # session/user, delegates to Clerk/Auth.js
│   │   ├── tracks.router.ts      # list tracks/challenges (reads content/tracks at build time)
│   │   └── progress.router.ts    # per-user challenge completion (CRUD only — no execution)
│   ├── db/
│   │   └── client.ts             # imports packages/db, nothing else touches Postgres directly
│   ├── trpc.ts                   # tRPC init, context (current user), middleware
│   └── server.ts
├── package.json
└── tsconfig.json
```

**Why tRPC, and why is this app deliberately "boring"?**
tRPC gives end-to-end type inference from `apps/api` straight into `apps/web/src/shared/lib/trpc.ts` with zero codegen step — a router function's return type *is* the client's return type. This matters because it's the same "single source of truth" principle applied to API contracts as `packages/contracts` applies to block contracts.

This app intentionally does **not** run user code. That boundary is what keeps v1 client-side-cheap (spec §7) and is exactly the seam v3 plugs into: v3 adds a *new* service (e.g. `apps/execution-worker/`, talking to Judge0/E2B via BullMQ) rather than bolting sandboxing onto this API.

---

## 7. `packages/db/` — schema, not queries

```
packages/db/
├── src/
│   ├── schema/
│   │   ├── users.ts
│   │   ├── tracks.ts
│   │   ├── challenges.ts
│   │   └── progress.ts
│   └── client.ts                 # Drizzle instance factory
└── drizzle.config.ts
```

Only `apps/api` imports this package. Query logic (not just table shape) stays out of `packages/db` and lives in the routers that use it — this package's only job is "what does the data look like," so schema migrations are reviewable independent of business logic changes.

---

## 8. `packages/grading-engine/` — pure, framework-free

```
packages/grading-engine/
├── src/
│   ├── runContractTests.ts       # given contract + user code + test cases -> pass/fail + hints
│   ├── hintMatchers.ts           # plain-language hints for common mistake patterns (spec §5)
│   └── types.ts
```

This package has **no React, no Sandpack, no DOM dependency.** It takes a contract (from `packages/contracts`) and a block of user code and returns a structured result. Keeping it pure means:
- It's unit-testable in milliseconds, no browser needed.
- v3's execution worker (a Node service, not a browser) can run the *exact same* grading logic server-side for backend blocks — again, additive, not a rewrite.

---

## 9. TypeScript usage, concretely

| Where | How TS is used | Why |
|---|---|---|
| `packages/contracts` | Zod schemas + `z.infer<>` | Single definition serves both compile-time types and runtime validation of untrusted user code. |
| `tsconfig.base.json` (root) | `"strict": true`, `"noUncheckedIndexedAccess": true`, path aliases (`@playground/contracts`, `@playground/ui`, …) | Every package/app extends this. Path aliases avoid `../../../../packages/contracts` spaghetti and make refactors safe. |
| `apps/web` Monaco integration | The learner's in-block editor is configured with the **same TS types as the contract** injected as an ambient `.d.ts`, so autocomplete inside the stub matches the real contract exactly. | This is what makes "the editor pre-fills a function stub based on the block's contract" (spec §2) actually teach the right shape, not just look like it does. |
| `apps/api` ↔ `apps/web` | tRPC router types imported directly by the client — no OpenAPI/codegen step. | End-to-end type safety with the least moving parts, appropriate for a solo/small team (spec §6). |
| `content/tracks/**/*.tests.ts` | Test files import `z.infer<typeof SomeContract>` to type the expected function signature under test. | Content authors get compile errors if a challenge's test doesn't match the contract it claims to test — catches broken content before it ships. |
| CI (`turbo.json` pipeline) | `tsc --noEmit` run per-package before `test`/`build` | Because contracts are the load-bearing wall of this whole architecture, a type error anywhere in `packages/contracts` must fail the build immediately, not surface later as a runtime grading bug. |

---

## 10. How this maps onto the versioned roadmap

| Version | What changes in this architecture | What doesn't |
|---|---|---|
| **v1** | Everything in §2–§9 above, built fully. | — |
| **v2** (bug-finding) | New content shape in `content/tracks/**` (canvases pre-loaded with broken code); `block-editor` gets a "load existing code" path instead of always using `stubGenerator`. | `packages/contracts`, `apps/api`, canvas/assembly engines — untouched, per spec §4 Phase 4. |
| **v3** (backend build) | New `apps/execution-worker/` (BullMQ + Judge0/E2B); `packages/contracts/src/backend/*` gets populated; `execution/` in `apps/web` gains a second runner that calls the worker instead of Sandpack. | `packages/contracts/src/frontend/*`, `apps/api`'s CRUD routers. |
| **v4** (backend bugs) | Same pattern as v2, applied to backend contracts/content. | Same engines reused, per spec §4/roadmap. |
| **v5** (fullstack merge) | `connection-rules.ts` gains frontend→backend legal connections; `AssemblyPreview` composes both block kinds into one running app. | No rewrite — this is the payoff of `kind: "frontend" \| "backend"` existing since v1. |

---

## 11. What v1 explicitly does *not* include (on purpose)

- No sandbox/Docker/Judge0/E2B — Sandpack only (deferred to v3).
- No `apps/execution-worker/`, no BullMQ/Redis (deferred to v3).
- No gamification, no candidate comparison/replay views (deferred to spec §8, the hiring layer).
- No CMS for content — `content/tracks/` is hand-authored JSON/TS until Phase 3+ justifies a UI for it.

Building any of the above into v1 would violate the "smallest complete loop" principle in spec §3 and slow down validating the core mechanic, which is the actual goal of this version.
