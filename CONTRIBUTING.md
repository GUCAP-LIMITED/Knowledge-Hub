# Contributing

Read [ARCHITECTURE.md](./ARCHITECTURE.md) first. This file lists the concrete rules. Most are
enforced automatically — if the linter or type-checker complains, fix the code, not the rule.

## Golden rules

1. **Respect the layers.** Dependencies point inward (`app → features → shared → core`). Inside a
   feature: `presentation → store → application → domain`, with `infrastructure` implementing
   domain ports. Cross-layer imports are blocked by ESLint.
2. **Business rules live in the domain.** If a store, component, or use case contains an `if` about
   business _meaning_, it belongs in a domain entity/value object/service.
3. **Stores are thin.** A Zustand store holds UI state and forwards intent to use cases. No HTTP, no
   business logic, no `if`-laden workflows.
4. **No business logic in components.** Components render state and dispatch actions. That's it.
5. **Model with types.** Prefer value objects (`Email`, `Password`) over raw `string`s for
   meaningful values. Make illegal states unrepresentable.
6. **Fail explicitly.** Expected failures return `Result<T, AppError>`. Never `throw new Error()`;
   throw a concrete `AppError` subclass. Never swallow errors (`catch {}`) — log with context or map
   to a `Result`.
7. **No magic strings.** Grant names, storage keys, endpoints, roles → named constants.
8. **Validate at the boundary.** Every external payload (env, API) is parsed with Zod before it
   reaches the domain.
9. **Abstract the outside world.** Time → `Clock`. Network → `HttpClient`. Logging → `Logger`.
   Never `new Date()`, `fetch`, or `console` directly in feature code.
10. **Import via public APIs.** Import a feature from `@features/<name>`, never a deep internal path.
11. **Forms delegate to the domain.** Use `react-hook-form` with `domainResolver` (`@shared/forms`),
    whose rules ARE the value objects (`Email.create`, `<Entity>Name.create`). No Zod _form_ schemas
    — Zod validates the data boundary (env, API, storage) only.

## Enforced limits (ESLint)

- No `any`, no non-null assertions (`!`), no `console` (use `Logger`), no `==`.
- Functions ≤ 80 lines, files ≤ 300 lines, complexity ≤ 12, ≤ 4 params, max depth 4.
- Explicit return types on exported/named functions.
- `import type` for type-only imports; no import cycles.
- Per-layer import bans (domain can't import React/Zustand/HTTP/infra, etc.).

## Definition of done

1. `npm run validate` passes (typecheck + lint with **0 warnings** + tests).
2. New behavior is tested at the right layer (see ARCHITECTURE §6).
3. New external payloads are Zod-validated; new config is added to `core/config` + `.env.example`.
4. Layering and the golden rules are respected.
5. `npm run build` is clean.

## Project layout

```
src/
  app/        composition root, router, providers, pages, error boundary
  core/       config, result, errors, http, domain, time, logger  (framework-agnostic)
  shared/     ui primitives, forms, utils                           (generic, reusable)
  features/   vertical slices, each DDD-layered (auth + tasks; scaffold via npm run new:feature)
  testing/    typed fakes + builders for tests
```
