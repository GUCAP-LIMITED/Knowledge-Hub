# AGENTS.md

Brief for AI coding agents working in this repo. **Read this first**, then the deep docs it links.

This is the canonical, tool-agnostic agent guide. It is read by **Antigravity**, **Cursor**, and other
`AGENTS.md`-aware tools. **Claude Code** reads [`CLAUDE.md`](./CLAUDE.md) (which imports this file).
Cursor also applies [`.cursor/rules/architecture.mdc`](./.cursor/rules/architecture.mdc).

> **Communication Hub frontend** — a React 18 + Vite + TypeScript SPA built on a strict, lint-enforced
> Clean / Domain-Driven architecture. The rules are load-bearing: if a change fights them, the change
> is almost always wrong. Most are enforced by `tsconfig` + ESLint, so the editor stops you in real time.

## Commands

- `npm run dev` — Vite dev server (http://localhost:5173)
- `npm run validate` — **the gate**: `typecheck` + `lint` + `test`. Must pass with **0 warnings**
  before AND after every change. CI and the pre-commit hook run it too.
- `npm run new:feature -- <name> [Entity]` — scaffold a complete feature slice (all layers, barrels,
  react-hook-form form, tests, testing doubles). **Use this — never hand-create the layer tree.**
- `npm run test` · `npm run test:watch` · `npm run test:coverage` · `npm run lint` · `npm run e2e`

## Architecture (enforced by ESLint, not just convention)

Dependencies point **inward**: `app → features → shared → core`.

- `core/` — framework-agnostic foundation: `config`, `result`, `errors`, `http`, `domain` (shared
  value objects used by 2+ features), `time`, `logger`. Imports nothing above it.
- `shared/` — generic UI primitives, `forms`, utils. Uses `core` only; knows no feature.
- `features/<name>/` — vertical slices, internally `presentation → application → domain`, with
  `infrastructure` implementing the domain ports (+ an optional thin Zustand store for client UI state).
- `app/` — the one composition root: wires concretes, router, providers. **Plain constructor/factory
  injection by hand — no IoC container, no reflection.** Each feature has its own `<name>-module.ts`.

## Design principles (DDD + OOP — _how_ to model, not just where files go)

**Paradigm:** Clean / Hexagonal (Ports & Adapters) + DDD tactical patterns + `Result`-based (railway)
error handling. The domain is pure and framework-free; React, HTTP, and storage plug in at the edges.

**DDD building blocks — reach for the right one:**

- **Value object** — immutable, compared by value, self-validating. Private constructor + static
  `create(raw): Result<VO, Error>`. **Make one when a value carries rules/invariants** (email, title,
  money, phone). **Don't wrap opaque or structureless values** — entity `id`s, bearer/refresh tokens,
  free-form text are correct as raw `string`s; a VO there is overengineering. Keep a VO feature-local
  until a **2nd feature** needs it, then **move** it to `core/domain` (`@core/domain`) — never copy it
  or import it from another feature.
- **Entity** — has identity (`id`) and behavior, and is **immutable** (a state change returns a _new_
  instance). Business rules live on it — never an anemic data bag.
- **Aggregate root** — the entity that owns an invariant/consistency boundary (e.g. `AuthSession`
  owns "is this token still valid?"). Reach its internals only through the root.
- **Domain error** — extend the feature's `XxxError` base (which extends `DomainError`) with a stable
  `code`; this separates business failures from infrastructure failures.
- **Port** (interface, in `domain/ports/`) — declares _what_ the domain needs (`AuthGateway`,
  `SessionStore`); the implementation lives in `infrastructure`. This is the Dependency Inversion seam.
- **Use case** (application service) — one class, one action (`CreateTaskUseCase`): validate input →
  call the domain via ports → return `Result`. No business rules of its own, no HTTP, no React.
- **Adapter / gateway** (infrastructure) — implements a port over `HttpClient`, parses the response
  with Zod, and maps it to the domain via a pure **mapper**. Anti-corruption layer: wire shapes never
  leak inward.

**OOP / SOLID discipline:**

- **Encapsulation** — private fields; constructors/factories enforce invariants; expose behavior, not
  raw mutable state.
- **Immutability** — entities and value objects never mutate; "changing" one returns a new instance.
- **Single Responsibility** — one class, one reason to change (one use case; one HTTP decorator = one
  concern).
- **Dependency Inversion** — depend on ports/abstractions and receive collaborators through the
  constructor `deps` object; never `new SomeConcreteClass()` outside a composition root.
- **Composition over inheritance** — extend behavior by composing (the HTTP decorator chain), not deep
  class trees. Inheritance is reserved for the `AppError`/`DomainError` taxonomy.
- **Tell, don't ask (rich domain)** — put the decision inside the domain object; don't pull its fields
  out and branch elsewhere. Any `if` about business _meaning_ belongs in an entity / value object /
  domain service — never in a store, component, or gateway.

## Non-negotiables

1. **Expected failures are values** — return `Result<T, AppError>` (`@core/result`). Never
   `throw new Error()`; throw a concrete `AppError` subclass. Never swallow errors (`catch {}`).
2. **Validate at the boundary** — parse every external payload (env, API, storage) with **Zod** in
   `infrastructure` / `core/config` before it reaches the domain.
3. **Model meaningful values as value objects** (`Email`, `<Entity>Name`): private constructor +
   static `create()` → `Result`. A VO used by 2+ features lives in `core/domain` (`@core/domain`).
4. **Abstract the outside world** — network → the `HttpClient` port (custom `fetch` + decorators,
   **never `axios` or `fetch` directly**); time → `Clock`; logging → `Logger` (never `console`).
5. **Server state → TanStack Query** at the presentation edge; **client/UI state → Zustand** (thin,
   delegates to use cases). Don't copy fetched data into a Zustand store.
6. **Forms → react-hook-form + `domainResolver`** (`@shared/forms`) whose rules ARE the value objects.
   **No Zod _form_ schemas** (Zod is for the data boundary only). Login stays hand-rolled by design.
7. **Import via public barrels** (`@features/<name>`); use path aliases (`@core` `@shared` `@features`
   `@app` `@testing`), never deep relative chains.
8. **Strict TypeScript** — no `any`, no non-null `!`, no `==`; explicit return types on named/exported
   functions; `import type` for type-only imports; no import cycles.
9. **Test each layer** — domain pure; use cases against fake ports (`src/testing/fakes`); a component
   integration test. New pure utilities get a test.

## Code style the linter enforces (your diff must pass with 0 warnings)

- **Size & complexity:** ≤ 300 lines per file, ≤ 80 lines per function, cyclomatic complexity ≤ 12,
  ≤ 4 parameters, nesting depth ≤ 4. Hitting a limit means **extract** a function/component/module —
  do not suppress the rule.
- **Explicit by default (C#-style):** every class member has `public`/`private`/`protected`; every
  named/exported function has an explicit return type.
- **Banned:** `any`, non-null `!`, `==`/`!=` (use `===`/`!==`), `var`, `alert`, `debugger`,
  reassigning parameters, and `console` — use the `Logger` instead (lint permits only
  `console.warn`/`console.error` as an escape hatch).
- **Promises:** never leave a floating or misused promise — `await` it or prefix with `void`.
- **`switch` over a union must be exhaustive** (handle every case or the build fails).
- **Imports:** `import { type X }` (inline) for type-only imports; no import cycles; no deep relative
  paths — use the `@core`/`@shared`/`@features`/`@app`/`@testing` aliases. Prefix an intentionally
  unused var/arg with `_`.

## Code smells to avoid

The linter already blocks the **mechanical** smells (oversized files/functions, high complexity, deep
nesting, too many params, `any`, `!`, `==`, `console`, floating promises, unused code). These
**design** smells no tool catches — they are on you:

- **Anemic domain** — business logic sitting in a store/component/use case instead of the
  entity/value object. An `if` about business _meaning_ outside the domain is the tell; move it in.
- **Fat store / god object** — a Zustand store (or any class) doing HTTP + business rules + UI state.
  Stores hold UI state and delegate to use cases; one class = one responsibility.
- **Primitive obsession** — a raw `string`/`number` for a value that has rules → make a value object
  (but _not_ for opaque ids/tokens/free text — see Design principles).
- **Duplicated logic** — the same rule/parse/shape in two places. Extract a helper or promote a VO to
  `core/domain`; never copy a domain rule between features.
- **Feature envy / boundary leak** — importing another feature's internals, or letting DTO/Zod wire
  shapes escape `infrastructure`. Cross features only via `@features/<name>`; map DTO→domain at the gateway.
- **Magic strings/numbers** — endpoints, storage keys, roles, limits → named constants.
- **Prop explosion / huge component** — extract once a component passes ~150 lines or ~7 props; prefer
  composition over a pile of boolean flags (avoid "boolean-trap" params).
- **Dead code & stubs** — remove unused exports, commented-out blocks, and stray logging before
  committing. Half-built work goes behind a flag, not left as a stub.
- **Suppressing the checker** — `eslint-disable` / `@ts-ignore` / `as any` means the code or the type
  is wrong. Fix the cause; suppress only with a comment justifying a genuine tool limitation.
- **Speculative abstraction** — don't add an interface/layer with one trivial implementation "just in
  case." (Equally, don't bypass the existing ports with raw `fetch`/`new Date()`/`console`.)

## Naming, files & styling

- **Files:** `kebab-case.ts` for logic (`create-invoice.ts`); `PascalCase.tsx` for components
  (`InvoicePage.tsx`). Tests sit next to the file (`create-invoice.test.ts`).
- **Names:** components `PascalCase`; hooks `useX`; value objects / use cases / gateways / errors are
  `PascalCase` classes; pure mappers/helpers are functions.
- **Styling — CSS Modules + design tokens only.** Use the CSS variables in
  `src/app/styles/global.css`. **No inline `style={{}}`, no Tailwind, no hard-coded colors.** Build
  conditional class names with `cn()` (`@shared/utils`). Reuse the Radix-based accessible primitives
  in `shared/ui` (`Button`, `Modal`, `DropdownMenu`, `Tooltip`, `Tabs`, `TextField`, `Spinner`,
  `Alert`) instead of hand-rolling widgets. Teal (`--color-primary`) is the workhorse; the orange
  accent (`--color-secondary`) is reserved for a few sanctioned "moments" — see
  [`docs/design-accents.md`](./docs/design-accents.md) before reaching for it.
- **Pages are code-split:** a routed `*Page` is **not** exported from the feature barrel — the router
  lazy-imports it from its module path. Export the module, provider, hooks, and types from
  `index.ts`; keep the page out of it.

## Where does this go?

| You're writing…                                     | It goes in…                                                 |
| --------------------------------------------------- | ----------------------------------------------------------- |
| A business rule / entity / "is this valid" check    | `features/<f>/domain/`                                      |
| A value object used by **2+ features**              | `core/domain/` (import via `@core/domain`)                  |
| A user action / workflow                            | `features/<f>/application/` (one class per use case)        |
| Code touching network or browser storage            | `features/<f>/infrastructure/` (gateway + Zod DTO + mapper) |
| A component, hook, page, or form for one feature    | `features/<f>/presentation/`                                |
| Client/UI state for a feature                       | `features/<f>/store/` (thin Zustand)                        |
| A reusable widget / form helper / pure util         | `shared/ui/` · `shared/forms/` · `shared/utils/`            |
| A cross-cutting port (http/logger/clock) or env var | `core/`                                                     |
| Wiring concretes, routes, providers                 | `app/`                                                      |

## Adding a feature

Run `npm run new:feature -- <name> [Entity]`, then perform the 3 wiring steps it prints
(composition root → provider → route). The generated slice mirrors `features/tasks`
(list + create + toggle + delete via TanStack Query); `features/auth` shows a store-backed feature.

## Deep docs (read when you need detail)

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — the contract and the _why_ (layers, DI, Result, token storage).
- [`docs/DEVELOPER_GUIDE.md`](./docs/DEVELOPER_GUIDE.md) — hands-on: build a feature end-to-end, how to
  call the API, the forms convention (§8).
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — the concrete rule list, enforced ESLint limits, definition of done.
