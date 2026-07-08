# Developer Guide — building features the right way

This is the **practical handbook** for working in this codebase. `ARCHITECTURE.md` explains _why_ the
rules exist; this document shows you _how_ to actually build a feature, where every file goes, and
exactly how to call the API. Read it once, then keep it open while you build your first feature.

> **Golden sentence:** business logic lives in plain TypeScript classes (domain + application);
> React, HTTP, and storage are details that plug in at the edges. If your business rule needs React
> to run, it's in the wrong place.

---

## 0. Before you write any code

```bash
npm install
npm run dev                          # http://localhost:5173
npm run validate                     # typecheck + lint + tests — must be green before AND after
npm run new:feature -- <name> [Entity]   # scaffold a whole feature (see §4.0)
```

`npm run validate` is the gate. The CI runs it, the git hook runs it, and **your PR will not be
accepted unless it passes with 0 warnings.** The rules below aren't suggestions — most are enforced
by `tsconfig` and ESLint, so the editor will stop you in real time.

---

## 1. The four layers (30-second recap)

```
app        ← composition root: DI wiring, router, providers, pages, error boundary
  │ depends on ▼
features   ← vertical slices (auth, tasks, …) — each internally layered with DDD
  │ depends on ▼
shared     ← generic, reusable UI primitives + pure utils (knows nothing about features)
  │ depends on ▼
core       ← framework-agnostic foundation: config, errors, Result, http, domain, time, logger
```

**Dependencies only ever point downward.** `core` never imports from `features`; one feature never
imports another feature's internals. This is enforced by `import/no-restricted-paths` — break it and
lint fails.

---

## 2. Where does my file go? (decision table)

| I'm writing…                                            | It goes in…                                 | Example                                        |
| ------------------------------------------------------- | ------------------------------------------- | ---------------------------------------------- |
| A business rule, an entity, a "what is valid" check     | `features/<f>/domain/`                      | `Note`, `NoteTitle`, `NoteGateway` (interface) |
| A value object / domain type shared by **2+ features**  | `core/domain/` (import via `@core/domain`)  | `Email`, `Money`, `InvalidEmailError`          |
| A user action / workflow ("create a note")              | `features/<f>/application/`                 | `CreateNoteUseCase`                            |
| Code that talks to the network / browser storage        | `features/<f>/infrastructure/`              | `NoteHttpGateway`, Zod DTOs, mappers           |
| A React component, hook, or page for one feature        | `features/<f>/presentation/`                | `NotesPage`, `useNotes()`                      |
| Client/UI state for a feature (not server data)         | `features/<f>/store/`                       | a Zustand store                                |
| A button, modal, input — reusable anywhere              | `shared/ui/`                                | `Button`, `Modal`, `TextField`                 |
| A pure helper used across features                      | `shared/` (or `core` if framework-agnostic) | `cn()`, formatters                             |
| Wiring concretes together, routes, providers            | `app/`                                      | `composition-root.ts`, `AppRouter.tsx`         |
| A new env var, a cross-cutting port (http/logger/clock) | `core/`                                     | `core/config`, `core/http`                     |

**Rule of thumb:** start in `domain`, push outward. If you're unsure whether something is "domain"
or "infrastructure", ask: _does this code know about HTTP, JSON, or the browser?_ If yes →
infrastructure. If it's a pure rule → domain.

**Shared value objects (the `@core/domain` kernel):** a value object lives in
`features/<f>/domain/` **while exactly one feature uses it**. The moment a _second_ feature needs
it, **move** it to `core/domain/` and import it from `@core/domain` everywhere — never reach into
another feature for it (`import { Email } from '@features/auth'` couples the features and is wrong).
The kernel may depend only on `@core/result` and `@core/errors` (lint blocks `@core/http` from
`core/domain`), so its error type is a plain `DomainError`; a feature that wants its
own vocabulary maps it at the boundary (e.g. the login use case maps `InvalidEmailError` to
`InvalidCredentialsError`). `Email` already lives here — copy it as the template.

**Don't over-make value objects.** A VO earns its place only when the value carries rules/invariants
(email, title, money, phone). Opaque or structureless values — entity `id`s, bearer/refresh tokens,
free-form text — stay raw `string`s; wrapping them is ceremony, not safety. The generator's
`<Entity>Name` VO is the typical "needs a rule" case; if several features end up with the _same_ rule,
promote it to `core/domain` instead of repeating it.

---

## 3. Anatomy of a feature

```
features/notes/
├── domain/
│   ├── entities/note.ts                # the Note aggregate (immutable, has behavior)
│   ├── value-objects/note-title.ts     # validated value object
│   ├── errors/note-errors.ts           # NotesUnavailableError, InvalidNoteTitleError
│   ├── ports/note-gateway.ts           # INTERFACE the app depends on
│   └── index.ts                        # domain barrel
├── application/
│   ├── use-cases/list-notes.ts
│   ├── use-cases/create-note.ts
│   └── index.ts
├── infrastructure/
│   ├── dto/note-api.dto.ts             # Zod schema + inferred DTO type
│   ├── note-mapper.ts                  # DTO → domain (pure function)
│   ├── note-http-gateway.ts            # implements NoteGateway over HttpClient
│   └── index.ts
├── presentation/
│   ├── use-notes.ts                    # TanStack Query hooks
│   ├── NotesModuleProvider.tsx         # injects the use cases via context
│   ├── use-notes-module.ts             # reads them back
│   ├── NotesPage.tsx + .module.css
│   └── index.ts                        # ⚠️ does NOT export the page (see §6)
├── notes-module.ts                     # feature composition root: wires everything
└── index.ts                            # PUBLIC API — outsiders import only from here
```

The dependency rule **inside** a feature (also lint-enforced):

```
presentation → store → application → domain ← infrastructure
                                       ▲
                          (infrastructure implements domain ports)
```

`domain` imports nothing but itself. `application` imports only `domain`. `infrastructure`
implements `domain` ports. `presentation` talks to the store / hooks, never to `infrastructure`
directly.

---

## 4. Build a feature, end to end (worked example: `notes`)

### 4.0 The fast path — `npm run new:feature`

Don't hand-create the tree. Run the generator and it stamps out a complete, **lint-clean,
test-passing** list + create slice — every layer, barrels, the react-hook-form + `domainResolver`
form, and the testing doubles (wired into `@testing`):

```bash
npm run new:feature -- invoices Invoice      # feature folder "invoices", entity "Invoice"
npm run new:feature -- notes                 # entity inferred as "Note"
```

The feature name is kebab-case; the optional entity is PascalCase (inferred by singularizing the
feature name when omitted). The generator **never edits your app wiring** — it prints the exact 3
steps (composition root → provider → route; see §4.5). After wiring, `npm run validate` should be
green. Then extend the slice (e.g. add `toggle`/`delete` like `features/tasks`).

The rest of this section explains, layer by layer, **what the generator produced and why** — read it
once so you can extend a generated feature confidently. (`features/tasks` is the fuller reference:
list + create + toggle + delete.)

### 4.1 Domain — model the problem (pure TypeScript, no React/HTTP)

**Value object** — never let a raw `string` masquerade as a validated title:

```ts
// features/notes/domain/value-objects/note-title.ts
import { type Result, ok, err } from '@core/result';
import { InvalidNoteTitleError } from '../errors/note-errors';

export class NoteTitle {
  private constructor(public readonly value: string) {}

  public static create(raw: string): Result<NoteTitle, InvalidNoteTitleError> {
    const trimmed = raw.trim();
    if (trimmed.length === 0 || trimmed.length > 120) {
      return err(new InvalidNoteTitleError(raw));
    }
    return ok(new NoteTitle(trimmed));
  }
}
```

Why: the `private constructor` + static `create` factory means **you cannot hold an invalid
`NoteTitle`.** Validation happens once, at the boundary, and the type system carries the guarantee
everywhere after.

**Entity** — immutable, with behavior (not an anemic data bag):

```ts
// features/notes/domain/entities/note.ts
export interface NoteProps {
  readonly id: string;
  readonly title: string;
  readonly pinned: boolean;
  readonly createdAt: Date;
}

export class Note {
  public readonly id: string;
  public readonly title: string;
  public readonly pinned: boolean;
  public readonly createdAt: Date;

  public constructor(props: NoteProps) {
    this.id = props.id;
    this.title = props.title;
    this.pinned = props.pinned;
    this.createdAt = props.createdAt;
  }

  /** Behavior returns a NEW Note — entities are immutable. */
  public withPinned(pinned: boolean): Note {
    return new Note({ ...this, pinned });
  }
}
```

**Errors** — extend the shared hierarchy; never `throw new Error('...')`:

```ts
// features/notes/domain/errors/note-errors.ts
import { DomainError } from '@core/errors';

/** Base type for every notes-domain failure — lets callers switch on intent. */
export abstract class NoteError extends DomainError {}

export class InvalidNoteTitleError extends NoteError {
  public readonly code = 'NOTES_INVALID_TITLE';
  public constructor(reason: string) {
    super(`Invalid note title: ${reason}`, { context: { reason } });
  }
}

export class NotesUnavailableError extends NoteError {
  public readonly code = 'NOTES_UNAVAILABLE';
  public constructor(cause?: unknown) {
    super('Notes are temporarily unavailable. Please try again.', { cause });
  }
}
```

> Note the pattern (mirrors `features/tasks/domain/errors`): an **abstract `NoteError extends
DomainError`** base, with concrete errors extending it. `NoteError` then serves as the error type
> across the port and use cases. Every concrete error carries a stable machine-readable `code`.

**Port** — the interface the rest of the app depends on. The domain declares _what_ it needs; it
does not care _how_:

```ts
// features/notes/domain/ports/note-gateway.ts
import type { Result } from '@core/result';
import type { Note } from '../entities/note';
import type { NoteTitle } from '../value-objects/note-title';
import type { NoteError } from '../errors/note-errors';

export interface NoteGateway {
  list(): Promise<Result<readonly Note[], NoteError>>;
  create(title: NoteTitle): Promise<Result<Note, NoteError>>;
}
```

Don't forget `domain/index.ts` re-exporting all of the above.

### 4.2 Application — one class per use case (orchestration only)

A use case validates input, calls the domain via ports, and returns a `Result`. **No HTTP, no
React, no try/catch around network code** (that's the gateway's job).

```ts
// features/notes/application/use-cases/create-note.ts
import { type Result, err, isErr } from '@core/result';
import type { Logger } from '@core/logger';
import { type Note, type NoteError, type NoteGateway, NoteTitle } from '../../domain';

export interface CreateNoteUseCaseDeps {
  readonly noteGateway: NoteGateway;
  readonly logger: Logger;
}

export class CreateNoteUseCase {
  private readonly noteGateway: NoteGateway;
  private readonly logger: Logger;

  public constructor(deps: CreateNoteUseCaseDeps) {
    this.noteGateway = deps.noteGateway;
    this.logger = deps.logger.child('create-note');
  }

  public async execute(rawTitle: string): Promise<Result<Note, NoteError>> {
    const title = NoteTitle.create(rawTitle);
    if (isErr(title)) {
      return err(title.error); // expected failure → a value, not a throw
    }
    this.logger.info('Creating note');
    return this.noteGateway.create(title.value);
  }
}
```

`ListNotesUseCase` is even simpler — it just delegates to `noteGateway.list()`. Export both from
`application/index.ts`.

### 4.3 Infrastructure — implement the port over `HttpClient`

This is the **only** layer that knows JSON wire formats. Validate every response with Zod, map to
the domain, and translate transport errors into a domain `Result`.

```ts
// features/notes/infrastructure/dto/note-api.dto.ts
import { z } from 'zod';

export const NoteDtoSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  pinned: z.boolean().default(false),
  createdAt: z.string(), // ISO date string on the wire
});
export const NoteListDtoSchema = z.array(NoteDtoSchema);
export type NoteDto = z.infer<typeof NoteDtoSchema>;
```

```ts
// features/notes/infrastructure/note-mapper.ts  (pure function, NOT a class)
import { Note } from '../domain';
import type { NoteDto } from './dto/note-api.dto';

export function toNote(dto: NoteDto): Note {
  return new Note({
    id: dto.id,
    title: dto.title,
    pinned: dto.pinned,
    createdAt: new Date(dto.createdAt),
  });
}
```

```ts
// features/notes/infrastructure/note-http-gateway.ts
import { type HttpClient, HttpError } from '@core/http';
import type { Logger } from '@core/logger';
import { type Result, ok, err } from '@core/result';
import {
  type Note,
  type NoteError,
  type NoteGateway,
  type NoteTitle,
  NotesUnavailableError,
} from '../domain';
import { NoteDtoSchema, NoteListDtoSchema } from './dto/note-api.dto';
import { toNote } from './note-mapper';

const NOTES_ENDPOINT = '/notes';

export interface NoteHttpGatewayDeps {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}

export class NoteHttpGateway implements NoteGateway {
  private readonly httpClient: HttpClient;
  private readonly logger: Logger;

  public constructor(deps: NoteHttpGatewayDeps) {
    this.httpClient = deps.httpClient;
    this.logger = deps.logger.child('note-gateway');
  }

  public async list(): Promise<Result<readonly Note[], NoteError>> {
    try {
      const raw = await this.httpClient.get<unknown>(NOTES_ENDPOINT);
      const parsed = NoteListDtoSchema.safeParse(raw);
      if (!parsed.success) {
        this.logger.error('Notes list had an unexpected shape', parsed.error);
        return err(new NotesUnavailableError(parsed.error));
      }
      return ok(parsed.data.map((dto) => toNote(dto)));
    } catch (cause) {
      return err(this.mapError(cause));
    }
  }

  public async create(title: NoteTitle): Promise<Result<Note, NoteError>> {
    try {
      const raw = await this.httpClient.post<unknown>(NOTES_ENDPOINT, {
        title: title.value,
      });
      const parsed = NoteDtoSchema.safeParse(raw);
      if (!parsed.success) {
        return err(new NotesUnavailableError(parsed.error));
      }
      return ok(toNote(parsed.data));
    } catch (cause) {
      return err(this.mapError(cause));
    }
  }

  private mapError(cause: unknown): NoteError {
    if (cause instanceof HttpError) {
      this.logger.error('Notes request failed', cause, { status: cause.status });
    } else {
      this.logger.error('Notes request failed', cause);
    }
    return new NotesUnavailableError(cause);
  }
}
```

> **This is the contract for talking to the network.** See §7 for the full API-call rules. Notice:
> you never touch `fetch`/`axios` — you depend on the `HttpClient` port, parse with Zod, and return
> a `Result`. The rest of the app never sees a raw HTTP error.

### 4.4 Presentation — hooks + a page

Server data goes through **TanStack Query** at the presentation edge. The `queryFn`/`mutationFn`
calls the **use case**, unwraps the `Result`, and throws the error so Query can surface it.

```ts
// features/notes/presentation/use-notes.ts
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { isErr } from '@core/result';
import type { Note } from '../domain';
import { useNotesModule } from './use-notes-module';

export const notesQueryKey = ['notes'] as const;

export const useNotes = (): UseQueryResult<readonly Note[]> => {
  const { listNotes } = useNotesModule();
  return useQuery({
    queryKey: notesQueryKey,
    queryFn: async (): Promise<readonly Note[]> => {
      const result = await listNotes.execute();
      if (isErr(result)) throw result.error; // Query exposes this via isError/error
      return result.value;
    },
  });
};

export const useCreateNote = (): UseMutationResult<Note, Error, string> => {
  const { createNote } = useNotesModule();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (title: string): Promise<Note> => {
      const result = await createNote.execute(title);
      if (isErr(result)) throw result.error;
      return result.value;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notesQueryKey });
    },
  });
};
```

The page consumes the hooks and `shared/ui` primitives. Always handle the three states —
**loading / error / empty** — and use CSS modules (never inline styles):

```tsx
// features/notes/presentation/NotesPage.tsx
import type { ReactElement } from 'react';
import { Alert, Spinner } from '@shared/ui';
import { useNotes } from './use-notes';
import styles from './NotesPage.module.css';

export const NotesPage = (): ReactElement => {
  const notes = useNotes();

  if (notes.isLoading) return <Spinner label="Loading notes" />;
  if (notes.isError) {
    return (
      <Alert tone="error" title="Could not load notes">
        Something went wrong. Please try again.
      </Alert>
    );
  }
  if (notes.data && notes.data.length === 0)
    return <p className={styles.empty}>No notes yet.</p>;

  return (
    <ul className={styles.list}>
      {notes.data?.map((note) => (
        <li key={note.id}>{note.title}</li>
      ))}
    </ul>
  );
};
```

**Dependency injection into hooks** uses a context provider (so use cases are injected, not global —
this keeps everything testable):

```tsx
// features/notes/presentation/NotesModuleProvider.tsx — provides the module
// features/notes/presentation/use-notes-module.ts — reads it back (throws if outside provider)
```

Copy these two files verbatim from `features/tasks` and rename `Tasks → Notes`. The pattern never
changes.

### 4.5 Wire the feature together

```ts
// features/notes/notes-module.ts — the feature's composition root
import type { HttpClient } from '@core/http';
import type { Logger } from '@core/logger';
import { CreateNoteUseCase, ListNotesUseCase } from './application';
import { NoteHttpGateway } from './infrastructure';

export interface NotesModule {
  readonly listNotes: ListNotesUseCase;
  readonly createNote: CreateNoteUseCase;
}

export const createNotesModule = (deps: {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}): NotesModule => {
  const noteGateway = new NoteHttpGateway({
    httpClient: deps.httpClient,
    logger: deps.logger,
  });
  return {
    listNotes: new ListNotesUseCase({ noteGateway, logger: deps.logger }),
    createNote: new CreateNoteUseCase({ noteGateway, logger: deps.logger }),
  };
};
```

```ts
// features/notes/index.ts — the PUBLIC API
export { createNotesModule, type NotesModule } from './notes-module';
export {
  NotesModuleProvider,
  useNotes,
  useCreateNote,
  notesQueryKey,
} from './presentation';
export type { Note } from './domain';
// ⚠️ Do NOT export NotesPage here — see §6 (code-splitting).
```

Then register it in the app shell:

```ts
// app/di/composition-root.ts
const notesModule = createNotesModule({ httpClient, logger });
// …add `notesModule` to the returned AppComposition object.
```

```tsx
// app/App.tsx — add the provider near the other module providers
<NotesModuleProvider module={composition.notesModule}>…</NotesModuleProvider>
```

```tsx
// app/router/AppRouter.tsx — lazy import from the MODULE PATH (not the barrel)
const NotesPage = lazy(async () => ({
  default: (await import('@features/notes/presentation/NotesPage')).NotesPage,
}));
// …add <Route path="/notes" element={<NotesPage />} /> under <ProtectedRoute>.
```

### 4.6 Test each layer

```
domain        → pure unit tests (NoteTitle.create valid/invalid, Note.withPinned immutability)
application   → use case against a FakeNoteGateway (src/testing/fakes)
infrastructure→ the mapper, with a builder (src/testing/builders)
```

Add `FakeNoteGateway` to `src/testing/fakes/` and a `note.builder.ts` to `src/testing/builders/`,
exported from `src/testing/index.ts`. Tests use the **fakes**, never the real network.

### 4.7 Done? Run the gate.

```bash
npm run validate && npm run build
```

Both green → your feature is complete. Not green → it isn't. There is no in-between.

---

## 5. How to call the API / fetch data (the important part)

### 5.1 The one rule

> **Never call `fetch` or `axios` directly.** Always go through the `HttpClient` port, from inside a
> feature's **infrastructure gateway**. Presentation never calls a gateway directly either — it
> calls a hook, which calls a use case, which calls the gateway.

```
Component → useQuery/useMutation (hook) → UseCase.execute() → Gateway → HttpClient → (network)
                                                 │
                                          returns Result<Domain, Error>
```

### 5.2 The `HttpClient` port

`core/http` gives you a typed client (injected into your gateway via the module):

```ts
httpClient.get<T>(path, options?)
httpClient.post<T>(path, body?, options?)
httpClient.put<T>(path, body?, options?)
httpClient.patch<T>(path, body?, options?)
httpClient.delete<T>(path, options?)
httpClient.postForm<T>(path, form, options?)   // application/x-www-form-urlencoded
```

`RequestOptions`:

| Field       | Meaning                                                                  |
| ----------- | ------------------------------------------------------------------------ |
| `headers`   | extra request headers                                                    |
| `query`     | querystring object (`undefined` values are dropped)                      |
| `signal`    | `AbortSignal` for cancellation (TanStack Query passes one automatically) |
| `anonymous` | `true` = do **not** attach the bearer token (login/refresh endpoints)    |

It returns the **parsed JSON body** (or `undefined` for `204`). On a non-2xx it **throws**
`HttpError` (`{ status, statusText, url, body, retryAfterMs }`); if no response arrives (offline,
DNS, CORS, timeout) it throws `NetworkError`. **Your gateway catches these and returns a `Result`.**

### 5.3 What you get for free (don't reimplement it)

The `httpClient` you receive is already wrapped in three resilience decorators (configured once in
the composition root). You write a plain `get`/`post`; the transport handles:

- **Auth** — the bearer token is attached automatically (kept in memory). Pass `anonymous: true`
  only for the token endpoints.
- **401 → silent refresh** — on an expired token, a single token refresh runs (de-duplicated across
  concurrent requests) and the request is replayed once. Users don't get bounced.
- **Timeout** — every request has a 15s deadline; a hung server becomes a `NetworkError`.
- **Retry** — idempotent **GET**s retry transient failures (network, `429`, `503`, `5xx`) with
  exponential backoff + jitter, honoring `Retry-After`. Writes (POST/PUT/PATCH/DELETE) are **never**
  retried (no double-submits).

So: **don't add retry/timeout/refresh logic in your gateway or hook.** It's already there.

### 5.4 Reading data — queries

Use `useQuery` in the presentation layer. The `queryFn` calls your use case and unwraps the
`Result`:

```ts
const result = await listNotes.execute();
if (isErr(result)) throw result.error; // Query → isError / error
return result.value; // Query → data
```

- **Query keys**: an array, most specific last — `['notes']`, `['notes', noteId]`,
  `['notes', { status }]`. Keep them consistent so invalidation works.
- **Caching/refetch defaults** live in the composition root (`staleTime` 30s, `retry` 1,
  `refetchOnWindowFocus` false). Override per-query only when you have a reason.
- **Cancellation**: TanStack Query gives the `queryFn` a `signal` — thread it into the gateway via
  `options.signal` if the call is expensive.

### 5.5 Writing data — mutations

```ts
const mutation = useMutation({
  mutationFn: async (input) => {
    const result = await createNote.execute(input);
    if (isErr(result)) throw result.error;
    return result.value;
  },
  onSuccess: () => {
    void queryClient.invalidateQueries({ queryKey: notesQueryKey }); // refetch the list
  },
});
mutation.mutate(title); // fire it
mutation.isPending; // disable the submit button
```

After a successful write, **invalidate the affected query keys** so the UI reflects the new state.
For instant feedback you can do optimistic updates (`onMutate` + rollback in `onError`) — but only
add that complexity when the UX needs it.

### 5.6 Errors — always a `Result`, never a surprise

- Inside **domain/application**, expected failures are **values**: `return err(new SomethingError())`.
  Callers must handle both branches — the compiler enforces it.
- Inside a **gateway**, wrap the network call in `try/catch`, log, and translate `HttpError`/
  `NetworkError` into your feature's `XUnavailableError` (or a more specific one, e.g. map `401`/`403`
  to a "not authorized" domain error). Map `400`/`422` validation responses to a meaningful error so
  the UI can show field messages.
- In **presentation**, a thrown error from the `queryFn`/`mutationFn` shows up as `query.error` /
  `mutation.error`. Render it with `<Alert>`; never let it reach the user as a raw stack trace.

---

## 6. Code-splitting: why pages aren't in the barrel

Routed page components (`NotesPage`) are **lazy-loaded** so they ship in their own chunk. For that
to work, the page must **not** be exported from the feature's `index.ts` (or its `presentation`
barrel) — because `app` statically imports that barrel for the module/provider, which would pull the
page into the initial bundle and defeat the split. So:

- Export the **module, provider, hooks, types** from `index.ts`.
- Lazy-import the **page** directly from its file path in `AppRouter.tsx`.

This is the one sanctioned exception to "import only from the barrel," and it exists purely for
bundle size.

---

## 7. State management — pick the right tool

| Kind of state                          | Tool                                         | Examples                                                      |
| -------------------------------------- | -------------------------------------------- | ------------------------------------------------------------- |
| **Server state** (owned by the API)    | **TanStack Query**                           | lists, entities, anything you `fetch`                         |
| **Client/UI state** (owned by the app) | **Zustand** (thin store) or local `useState` | auth session, theme, a multi-step form, "is this drawer open" |

Do **not** copy fetched data into a Zustand store — you'd be reinventing caching/refetch/staleness
(badly). Let Query own server data; let Zustand own UI intent. A Zustand store here is thin: it holds
state and **delegates to use cases** (see `features/auth/store/auth-store.ts`). No business logic in
stores.

---

## 8. UI, components & styling

- Reusable, generic widgets live in `shared/ui` (each in its own folder: `Component.tsx` +
  `Component.module.css`, exported from `shared/ui/index.ts`). Feature-specific components live in
  that feature's `presentation/`.
- **Styling = CSS Modules + design tokens.** Use the CSS variables in `app/styles/global.css`
  (`--color-*`, `--radius-*`, `--shadow-*`). **No inline styles, no Tailwind.** Light/dark are
  handled by tokens.
- **Accessible complex widgets** (Modal, Dropdown, Tooltip, Tabs) are built on **Radix** and already
  exist in `shared/ui` — use them instead of hand-rolling. Transitions use **Motion**
  (`MotionConfig reducedMotion="user"` is set globally; presets in `shared/ui/motion`).
- Keep components small and focused. The linter enforces `max-lines`, `max-lines-per-function`,
  `complexity`, and `max-depth` — if you hit a limit, extract a component or a helper.

### Forms — react-hook-form + the domain resolver

Forms use **react-hook-form** for form state, with validation that **delegates to the domain value
objects** via `domainResolver` (`@shared/forms`) — **never a Zod form schema**. The VO is the single
source of truth for "what is valid"; a Zod schema would duplicate that rule and drift. (Zod stays at
the data boundary only — DTOs, config, storage; see §5.) `shared/ui` inputs forward their `ref`, so
`{...register('field')}` drops straight in.

```tsx
interface AddTaskFormValues {
  title: string;
}

const {
  register,
  handleSubmit,
  reset,
  formState: { errors },
} = useForm<AddTaskFormValues>({
  defaultValues: { title: '' },
  // The resolver runs the SAME TaskTitle.create the use case calls.
  resolver: domainResolver<AddTaskFormValues>({ title: (v) => TaskTitle.create(v) }),
});

// errors.title?.message is the value object's error message, surfaced inline.
<TextField label="New task" error={errors.title?.message} {...register('title')} />;
```

The reference implementation is `features/tasks/presentation/AddTaskForm.tsx` — copy it. The use case
still re-validates through the VO (the resolver is for inline UX, the use case is authoritative), and
a transport error from the mutation is shown on the same field.

> **Exception — login.** `LoginPage` deliberately stays a thin, hand-rolled form with no field-level
> validation: at the auth boundary we don't disclose "bad email format" vs "wrong password" (the
> login use case maps both to `InvalidCredentialsError`). Don't add a resolver there.

---

## 9. Config, logging, time (cross-cutting)

- **Env vars**: only `core/config` reads `import.meta.env`. To add a var, add it to the Zod schema
  in `core/config/app-config.ts` and document it in `.env.example`. Everything else receives typed
  config via injection — never read `import.meta.env` in a feature.
- **Logging**: inject the `Logger` and call `logger.child('scope')` in each class (see the gateways).
  Never use `console.*` directly (lint blocks it outside `core/logger`).
- **Time**: never call `new Date()` / `Date.now()` in business logic. Inject the `Clock` port
  (`clock.now()`) so tests are deterministic.

---

## 10. Conventions & naming

- **Classes** (use cases, gateways, entities, value objects, errors). Functions for pure mappers/
  helpers. Every class member needs an explicit `public`/`private`/`protected` (enforced — C#-style).
- **Files**: `kebab-case.ts` for logic (`create-note.ts`), `PascalCase.tsx` for components
  (`NotesPage.tsx`). Tests sit next to the file: `create-note.test.ts`.
- **Barrels** (`index.ts`) are the public surface — import from `@features/notes`, not deep paths
  (except the lazy page, §6). Use the path aliases `@core` `@shared` `@features` `@app` `@testing`,
  never long relative `../../..` chains.
- **No `any`, no `!` (non-null), no `as` casts** to dodge the type system. If you reach for one,
  the model is probably wrong — fix the type, not the symptom.
- **`Result` over `throw`** for expected failures. Reserve exceptions for truly exceptional cases.

---

## 11. Pre-PR checklist

- [ ] Feature has all layers: domain → application → infrastructure → presentation, plus
      `<feature>-module.ts` and `index.ts`.
- [ ] All network access goes through a gateway + `HttpClient`; responses validated with Zod and
      mapped to the domain; errors returned as `Result`.
- [ ] Server data uses TanStack Query; mutations invalidate the right query keys; loading/error/empty
      states handled in the UI.
- [ ] New env vars added to `core/config` schema **and** `.env.example`.
- [ ] Page route is lazy-loaded and **not** exported from the barrel.
- [ ] Tests added per layer using fakes/builders from `@testing`.
- [ ] `npm run validate` and `npm run build` are **both green** (0 warnings).

---

## 12. Cheat sheet

```ts
import { type Result, ok, err, isOk, isErr } from '@core/result';
import { DomainError } from '@core/errors';
import { type HttpClient, HttpError, NetworkError } from '@core/http';
import type { Logger } from '@core/logger';
import type { Clock } from '@core/time';

// Use case shape
export class DoThingUseCase {
  public constructor(private readonly deps: Deps) {}
  public async execute(input: Input): Promise<Result<Output, MyError>> {
    /* … */
  }
}

// Gateway call shape
try {
  const raw = await this.httpClient.get<unknown>('/things', { query, signal });
  const parsed = ThingSchema.safeParse(raw);
  if (!parsed.success) return err(new ThingsUnavailableError(parsed.error));
  return ok(parsed.data.map(toThing));
} catch (cause) {
  return err(this.mapError(cause));
}

// Query hook shape
useQuery({
  queryKey: ['things'],
  queryFn: async () => {
    const r = await listThings.execute();
    if (isErr(r)) throw r.error;
    return r.value;
  },
});
```

**When in doubt, open `features/tasks` — it's the reference implementation of everything above.**
