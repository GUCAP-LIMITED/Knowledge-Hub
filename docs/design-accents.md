# Accent usage — the orange rule

UAPP Academy runs on **two brand colours**:

| Role          | Token               | Hex       | Carries…                                             |
| ------------- | ------------------- | --------- | ---------------------------------------------------- |
| **Primary**   | `--color-primary`   | `#045d5e` | the teal workhorse — most actions, nav, links, fills |
| **Secondary** | `--color-secondary` | `#fc7300` | the orange **spark** — a few high-signal moments     |

Teal does the work. **Orange is a spark, not a surface** — it only stays special if
it appears rarely and deliberately. Reach for the semantic tokens (`--color-secondary`,
`--color-secondary-soft`, `--color-secondary-strong`) — never a raw `#fc7300`.

## Where orange is sanctioned (the DO list)

Use orange **only** for these moments. Each is already backed by a primitive, so you
apply the primitive rather than hand-rolling the colour:

- **Brand mark** — the `UA` logo tile's teal→orange gradient (`AppLayout`). The identity.
- **Page-title accent bar** — the 4px bar beside a screen title (`PageHeader`). One per page.
- **Accent CTA** — `<Button variant="accent">` for a single secondary-emphasis action on a
  view (e.g. "Take a quiz"). Never the main action — that's `variant="primary"` (teal).
- **Notification badge** — the unread-count dot on the bell (`NotificationsBell`).
- **Secondary tag** — `<Badge tone="secondary">` for lightweight status chips like
  "Required" / "Updated" (soft orange fill, strong orange text).
- **One highlighted metric** — a `StatCard` with the secondary tone, when a single number
  deserves to stand out from its neighbours.
- **Illustration accent** — the small accent dot on the `Spot` empty-state motif.
- **Celebration** — confetti pieces on success moments (`Celebration`).
- **Auth hero** — accent touches on the login split-screen.

Rule of thumb: **at most one orange "moment" competing for attention per screen** (the
page-title bar and the brand mark are ambient and don't count).

## Where orange is NOT allowed (the DON'T list)

- **Primary actions / main CTAs** → teal (`variant="primary"`). Orange never outranks teal.
- **Destructive actions** → red (`--color-danger`, `variant="danger"`).
- **Success / positive state** → green (`--color-success`).
- **Links & inline text** → teal or text tokens; never orange body copy.
- **Large fills, page/section backgrounds, cards** → surface tokens. Orange is trim, not fill.
- **A second accent on the same screen** competing with an existing orange moment.

## Applying it

Prefer the primitive over the token, and the token over a literal:

1. `<Button variant="accent">`, `<Badge tone="secondary">`, `<PageHeader>`, `<Spot>` — these
   already encode the sanctioned usage.
2. If you must style directly, use `var(--color-secondary[-soft|-strong])` in a CSS Module.
3. A raw `#fc7300` (or any hex) is always wrong — see the token discipline in
   [`AGENTS.md`](../AGENTS.md) and the dark-mode audit.

If a design seems to need orange somewhere not on the DO list, it almost always wants teal,
a status colour, or a neutral — reach for those first.
