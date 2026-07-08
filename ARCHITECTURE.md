# Architecture

This document is the contract. If a change fights these rules, the change is almost always wrong.
The rules are enforced by `tsconfig`, ESLint (`eslint.config.ts`) and the test suite — not just by
convention.

## 1. Mental model

The app is organized into **layers** and **features**. Dependencies always point **inward**:

```
app          composition root: DI wiring, router, providers, pages, error boundary
  │  depends on ▼
features     vertical slices (auth, …), each internally layered with DDD
  │  depends on ▼
shared       generic, reusable UI primitives + pure utilities (no feature knowledge)
  │  depends on ▼
core         framework-agnostic foundation: config, errors, Result, http, domain, time, logger
```

- `core` knows nothing about `shared`, `features`, or `app`.
- `shared` may use `core`, nothing above it.
- `features` may use `core` and `shared`, never `app`, never another feature's internals.
- `app` may use everything — it is the only place that wires concretes together.

These four boundaries are enforced by `import/no-restricted-paths` in `eslint.config.ts`.

## 2. Inside a feature (DDD)

Every feature (`src/features/<name>/`) is split into layers with strict, lint-enforced rules:

```
domain/          Entities, value objects, aggregates, domain errors, PORTS (interfaces).
                 Pure TypeScript. No React, no Zustand, no HTTP/DI, no other layer. The rules live here.
application/     Use cases (one class per use case). Orchestration only — validate input, call the
                 domain via ports, return a Result. Depends on domain abstractions only.
infrastructure/  Implements domain ports (HTTP gateways, storage), DTOs + Zod schemas, mappers.
                 The only place that knows wire formats. No React/presentation/store.
presentation/    React components, hooks, route guards. Talks to the store, never to infra directly.
store/           Zustand store: UI state + actions that delegate to use cases. NO business logic.
<name>-module.ts Feature composition root: wires concretes → use cases (+ store, if any).
index.ts         Public API. Other code imports ONLY from here.
```

The dependency rule inside a feature, also lint-enforced (`no-restricted-imports` per layer):

```
presentation ─▶ store ─▶ application ─▶ domain ◀─ infrastructure
                                          ▲
                              (infrastructure implements domain ports)
```

### Data & control flow (auth example)

```
LoginPage (presentation)
   └─ useAuth() ─▶ authStore.login(email, password)   store: UI state only
        └─ LoginUseCase.execute(email, password)      application: orchestration
             ├─ Email.create / Password.create        domain: validation (value objects)
             ├─ AuthGateway.authenticate(email, pw)    domain port …
             │     └─ AuthHttpGateway (infrastructure)  … implemented over HttpClient + Zod + mapper
             └─ SessionStore.save(session)            domain port (LocalSessionStore impl)
```

Everything that can fail for an _expected_ reason returns a **`Result<T, AppError>`** (see
`src/core/result`). Use cases never throw for expected failures; callers must handle both branches —
the compiler makes sure of it.

## 3. Key building blocks (`core`)

| Module        | Purpose                                                                         |
| ------------- | ------------------------------------------------------------------------------- |
| `core/config` | Zod-validated, typed `AppConfig`. Nothing reads `import.meta.env` directly.     |
| `core/result` | `Result<T, E>` — explicit success/failure in the type system.                   |
| `core/errors` | `AppError` hierarchy (+ `DomainError`). Never `throw new Error('...')`.         |
| `core/http`   | `HttpClient` port + `FetchHttpClient`. Throws typed `HttpError`/`NetworkError`. |
| `core/domain` | Shared value objects + their errors used by 2+ features (e.g. `Email`).         |
| `core/time`   | `Clock` port (+ `SystemClock`, `FixedClock`). Never call `new Date()` in logic. |
| `core/logger` | `Logger` port + `ConsoleLogger`. The only sanctioned `console` wrapper.         |

## 4. Dependency injection

There is **one composition root**: `src/app/di/composition-root.ts`. It is the only place that
constructs concrete implementations and joins layers. Everything else receives collaborators via
constructors (classes) or props (components), which keeps units isolated and testable. There is
**no IoC container, no decorators, no reflection** — wiring is plain, explicit constructor/factory
injection done by hand. Each feature has its own small composition root (`<name>-module.ts`) that the
app root calls; the app root also owns the singletons (config, logger, clock, the HTTP pipeline,
`QueryClient`) and threads them in.

**Fast path:** run `npm run new:feature -- <name> [Entity]`. It scaffolds a complete, lint-clean,
test-passing slice (every layer + barrels + a react-hook-form form + tests + testing doubles) and
prints the steps to wire it into the app. The manual recipe below is exactly what it produces:

1. `src/features/<name>/domain/` — model the problem: entities, value objects, ports, errors.
2. `application/` — write use cases that orchestrate the domain.
3. `infrastructure/` — implement the ports (HTTP/storage), with DTOs + Zod + a mapper.
4. `store/` _(optional)_ — a thin Zustand store for client UI state. Server state goes through
   TanStack Query at the presentation edge (§7), so many features have no store.
5. `presentation/` — components/hooks/guards. Forms use `react-hook-form` + `domainResolver`.
6. `<name>-module.ts` — wire it; `index.ts` — export the public API.
7. Register routes in `src/app/router/AppRouter.tsx`.
8. Test each layer (domain in isolation, use cases with fake ports, a component test).

`src/features/tasks` (list + create + toggle + delete via TanStack Query) is the worked reference;
`src/features/auth` shows a store-backed feature.

## 6. Testing strategy

- **Domain**: pure unit tests (value objects, entities, aggregates) — fast, no mocks.
- **Application**: use cases against hand-written fakes of the ports (`src/testing/fakes`).
- **Infrastructure**: mappers/serialization with builders (`src/testing/builders`).
- **Store/Presentation**: store behavior + a component integration test through the real store.

Test doubles live in `src/testing` and are typed implementations of the same ports the app uses.

## 7. Server state

Keep two kinds of state distinct:

- **Client state** (UI flags, form values, the auth session) → Zustand, exactly as today. Stores
  stay thin and forward intent to use cases.
- **Server state** (fetched data: lists, entities, anything the API owns) → **TanStack Query**.
  Don't hand-roll loading/error/cache flags in a store. Query lives at the **presentation edge**: a
  hook calls the use case (or gateway), which still validates the DTO with Zod, maps to the domain,
  and returns a `Result<T, AppError>`. Query only owns caching, refetching, and request lifecycle —
  the domain contract is unchanged.

The flow stays the same as everywhere else; Query is just the transport of "when to fetch":

```
Component → useQuery(...) → useCase.execute() → Gateway (Zod + mapper) → Result<Domain, AppError>
```

The `QueryClient` is a singleton concrete, so it is created in the **composition root** and provided
via `QueryClientProvider` in `app/` — never imported directly inside a feature. This keeps the
single-composition-root rule (§4) intact and lets tests build an isolated client.

## 8. Auth & token storage

**Decision.** Session tokens are persisted in `localStorage` via `LocalSessionStore` (the default
binding of the `SessionStore` port). This keeps the app a pure SPA — no backend session, no cookie
plumbing — which is the simplest, most portable option for the template.

**Trade-off.** `localStorage` is readable by any script on the origin, so a successful XSS would
expose the token. We accept this only alongside two non-negotiable mitigations: ship a **strict
Content-Security-Policy**, and never render untrusted HTML (`dangerouslySetInnerHTML` is banned on
untrusted input). Tokens carry the shortest practical lifetime, and the access token is held in
memory for the request hot-path (see the composition root) so it is not re-read from storage on
every call.

**Swap path.** Nothing in `domain` or `application` knows where the session lives — callers depend
only on the `SessionStore` port. To move to httpOnly cookies / a BFF, implement that port with an
adapter that lets the browser store the cookie (and, for a BFF, exchanges the secret server-side),
then bind the new implementation in the composition root in place of `LocalSessionStore`. No
domain, application, or presentation code changes — that is the whole point of the port.
