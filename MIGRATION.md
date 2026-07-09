# Knowledge Hub — Clean Architecture + DDD migration

This repository was upgraded from a single-file React prototype (`KnowledgeHub.jsx`) into the
**Clean / Hexagonal + DDD** structure used by the GUCAP `React-CleanWithDDD-Template` and the
Communication-Hub project. This document records what changed, the decisions taken, and exactly how
to continue the migration.

## TL;DR

- ✅ The full architectural **rails** are in place (strict TypeScript, ESLint layer-boundary
  enforcement, path aliases, Vitest/Playwright, Husky, the `new:feature` generator, docs).
- ✅ **Six Knowledge Hub features** migrated end-to-end as vertical DDD slices: `courses`,
  `tutorials`, `resources`, `certificates`, `submissions` (the review workflow — My Submissions +
  Approvals, one `Submission` aggregate), and `course-reviews` (learner reviews + admin moderation,
  one `Review` aggregate).
- ✅ **Auth** adapted to the UAPP demo directory (offline sign-in with real role-gating), and
  role-gated routes/nav (`/submissions` for admin+manager, `/approvals` + `/course-reviews` for
  admin).
- ✅ A KH-branded **app shell** (sidebar + header layout, dashboard) and router.
- ✅ `npm run validate` is **green** (typecheck + lint + **92 tests**), `npm run build` succeeds,
  `npm run dev` runs.
- 🔜 The remaining prototype areas are listed below — each is now a mechanical `new:feature` job.

## How to run

```bash
npm install
npm run dev        # http://localhost:5173  (or --port 4000)
npm run validate   # typecheck + lint + test — the gate, must stay green
npm run build
```

**Demo sign-in** (prefilled on the login screen): `admin@uapp.com`, `manager@uapp.com`, or
`consultant@uapp.com` — any password. Roles come through so route/role gating works.

## Key decisions

1. **Adopted the template's validated rails wholesale**, then migrated the domain on top. This gave
   an immediately green baseline before any custom code, so every step could be checked against
   `npm run validate`.
2. **In-memory gateways instead of HTTP.** The prototype has no backend, so each feature binds an
   `InMemory<X>Gateway` seeded from the prototype's mock data. These are legitimate infrastructure
   adapters that satisfy the domain **port**. Going live = implement an `Http<X>Gateway` (Zod DTO +
   mapper) and bind it in the feature's `<name>-module.ts`. **No domain/application/presentation
   change** — that is the whole point of the port.
3. **Demo auth via a swapped adapter.** `InMemoryAuthGateway` authenticates the seeded UAPP accounts
   offline; `createAuthModule({ demoAuth: true })` selects it over `AuthHttpGateway`. Same ports,
   same use cases, same store.
4. **`courses` is the new canonical reference slice** (it replaces the template's `tasks`, which was
   removed). `courses` shows a query-backed feature with a mutation; `auth` shows the store-backed
   pattern. The `docs/` and `AGENTS.md` still say "tasks" in prose — read `courses` as the exemplar.
5. **Shared `Category` value object** was promoted into the core kernel (`@core/domain`) because it
   is used by more than one feature, exactly as the rules prescribe. Opaque values (certificate ids,
   credential ids) were deliberately **not** wrapped in value objects.
6. **The prototype is preserved** under `legacy/prototype/` (the original `KnowledgeHub.jsx` and the
   Ant Design `create/` flow) as the behaviour spec. It is excluded from lint/typecheck/tests.

## What was migrated (per feature, mirrors the reference slice exactly)

Each feature has: `domain/` (entity + value object + errors + port), `application/use-cases/`,
`infrastructure/` (seed + in-memory gateway), `presentation/` (module context/provider/hook, Query
hooks, page + card, CSS Modules), `<name>-module.ts`, `index.ts` barrel, plus testing fakes/builders
and layer tests.

| Feature        | Entity behaviour                            | Use cases                   | Mutation?               |
| -------------- | ------------------------------------------- | --------------------------- | ----------------------- |
| `courses`      | `isCompleted`, `hasStarted`, `withProgress` | list / get / updateProgress | yes (progress)          |
| `tutorials`    | `isBeginnerFriendly`                        | list / get                  | no                      |
| `resources`    | `withHelpful`, `isPopular`                  | list / markHelpful          | yes (helpful)           |
| `certificates` | `belongsTo`, `issuedYear`                   | list / get                  | no (no VO — opaque ids) |

`submissions` is the richest slice: the `Submission` **aggregate** owns a state machine — every
transition (`flagForReview` / `approve` / `reject` / `publish`) validates the current status and
returns a `Result`, so an illegal move is impossible from a component or store. A `RejectionReason`
value object enforces "a rejection needs a reason". It exposes **two pages** from one feature
(`SubmissionsPage` = author view + submit form via RHF + `domainResolver`; `ApprovalsPage` = admin
queue with status tabs, approve/reject/flag/publish) — a separate `approvals` feature would have to
import this one's internals, which the boundary rules forbid. Admins publish directly; everyone else
enters the review queue.

`course-reviews` is the second two-page feature over one aggregate. The `Review` entity uses a
**deterministic `courseId:userId` id** to encode the "one review per user per course" invariant
(re-submitting upserts). Two value objects — `Rating` (1–5) and `ReviewFeedback` — guard input, and
`averageRating()` is a pure domain function ("course rating = mean of its reviews"). `ReviewsPage`
(all learners) writes/edits via RHF + `domainResolver` with a custom star input and marks reviews
helpful; `CourseReviewsPage` (admin) moderates with delete.

App shell: `src/app/layout/AppLayout.tsx` (sidebar nav + header), rebranded
`src/app/pages/DashboardPage.tsx`, `src/app/styles/global.css` design tokens set to the UAPP palette
(teal `#045D5E` / orange `#FC7300`, Inter, dark-mode aware), router + composition root + providers.

## Also migrated (Phases 1–3)

Beyond the six data features above, the app now covers the full prototype:

- **Design system + shell + dark mode** — token-driven `shared/ui` primitives (Badge, Avatar,
  ProgressBar, StatCard, PageHeader, EmptyState, Toggle, Skeleton, Select, Textarea, CategoryBadge),
  a `ThemeProvider` dark-mode toggle, a grouped role-aware sidebar + header user menu, and a
  live-stats dashboard.
- **Course detail + enroll** (`/courses/:id`) with hero, outcomes, generated curriculum, details
  sidebar and an embedded reviews panel; **Approvals review modal + decision timeline**.
- **My Learning**, **Profile**, **User Settings** (app pages; local persistence via `useLocalStorage`).
- **team** (Team Progress), **assignments** (Assign Training), **content** (Content Management with a
  draft→review→published state machine) — role-gated DDD feature slices.
- **notifications** — announcements aggregate + a header bell with unread count and a panel.

## What remains

- **content-creation** — port the Ant Design authoring wizard (`legacy/prototype/src/create`) to
  RHF + `domainResolver`, CSS Modules, and a `CreateContentUseCase` that emits a submission. This is
  the last prototype surface not yet ported into the architecture.

Role gating for admin/manager pages: nest their routes under `<ProtectedRoute anyOf={['admin']} />`
(or `['admin','manager']`) in `AppRouter.tsx` — the guard already supports it.

## Adding the next feature

```bash
npm run new:feature -- submissions Submission
```

Then do the 3 wiring steps it prints (and which `courses` already demonstrates):

1. **`src/app/di/composition-root.ts`** — build the module (`createSubmissionsModule({ logger })`)
   and add it to `AppComposition`.
2. **`src/app/App.tsx`** — nest its `<SubmissionsModuleProvider module={composition.submissionsModule}>`.
3. **`src/app/router/AppRouter.tsx`** — `lazy()`-import its `Page` from the module path and add the
   `<Route>` (under `AppLayout`, with an `anyOf` role gate if needed).

Swap the generated HTTP gateway for an `InMemory<X>Gateway` seeded from `legacy/prototype` data to
keep it running offline, exactly like `courses`.

## The gate

`npm run validate` must pass with **0 warnings** before and after every change (typecheck + lint +
test). The `legacy/` prototype is excluded from all three.
