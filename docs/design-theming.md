# Theming & dark mode

Light and dark are one set of **design tokens**, switched by an attribute on `<html>`. Components
never branch on the theme: they use tokens, and the tokens change underneath them.

## Scope: dark only

Dark-mode work must not change light mode. Anything visual that is new (sidebar rail shape, alias
tokens, placeholder colour, document-viewer chrome, brand-icon colour) is scoped under
`[data-theme='dark']`; the light rules and the `:root` values are the pre-theme originals. The
only additions to `:root` are new custom properties that light styles do not read.

## Palette

Dark is the **Communication Hub** theme: a teal-tinted near-black, not navy or neutral grey.
Hub token -> Academy token: `bg #0f1517`, `off-hours -> bg-subtle #11181b`, `surface #1a2226`,
`surface-muted #222c30`, `text #e8edef`, `text-mid -> text-muted #a8b5bd`,
`text-soft -> text-subtle #7c8a92`, `primary #3fb5b7` (lifted brand teal), `primary-10 ->
primary-soft / nav-hover`, borders `rgba(255,255,255,.07 / .13)`. `--color-action` (filled CTA with
white text) is `#1f7e80` (4.8:1 with white; Hub's own `#2d9799` is only 3.5:1), and
`--color-secondary-strong` (count badge) is `#c25400` (4.6:1). Input borders are `.24` white
(2.2:1 vs the surface) and hairlines `.09`, a deliberate step above Hub's `.13` / `.07`. The sidebar rail
follows Hub's `HubSubNav` (232px / 64px, pill items, 2px hover lift, orange count badge).

## How it works

| Piece           | Where                                                   | Role                                                                 |
| --------------- | ------------------------------------------------------- | -------------------------------------------------------------------- |
| Tokens          | `src/app/styles/global.css`                             | `:root` = light, `[data-theme='dark']` = dark overrides              |
| Blocking script | `index.html`                                            | Sets `data-theme` before first paint (no light flash for dark users) |
| Provider        | `src/app/theme/ThemeProvider.tsx`                       | Owns state, applies `<html data-theme>`, persists explicit choice    |
| Toggle          | `AppHeader` (moon/sun), `UserSettingsPage` (Appearance) | Calls `useTheme().toggle()`                                          |

**Resolution order:** stored choice (`localStorage['uapp:theme']`) → system preference
(`prefers-color-scheme`) → light. Only an **explicit toggle** is persisted, so a user who never
toggled keeps following the OS live; a stored choice always wins. Other tabs sync via the `storage`
event. The key and order in `index.html` must stay in sync with `ThemeProvider.tsx`.

`color-scheme` is set per theme so native controls, scrollbars and form widgets follow the _app_
toggle, not just the OS.

## Rules for components

1. **Colours come from tokens** (`var(--color-surface)`, `var(--color-text)` ...). No hex, `rgb()`,
   `white`/`black`, and no inline `style={{ color/background }}`.
2. **Translucent chips over media** use `color-mix(in srgb, var(--color-surface) 90%, transparent)`,
   never `rgba(255,255,255,.9)` (a white blob in dark).
3. **`--color-*-strong` is TEXT-only.** It is deliberately lightened in dark; never use it as a
   fill/hover background.
4. **Need a different value in dark?** Add a token override in `global.css` first. Only if the
   component truly differs, add `[data-theme='dark'] .x { ... }` in its CSS module.
5. **Third-party renderers** that take colour config (document viewer, charts) are given
   `var(--color-*)` strings so they follow the theme with no hook. Features must not import
   `@app/theme`; layering is `app -> features`.
6. **Fixed-colour surfaces are intentional**, not bugs: video/PDF/Office chrome, the
   `--color-media-placeholder` box, certificate artwork (data, print). Pin certificate-like subtrees
   with the light island: `<div data-theme="light">`.

## Token groups with dark-specific values

Surfaces (`bg`, `surface`, `surface-muted`, `surface-hover`), borders, text tiers, `action`/`link`
(brand teal lifts for contrast), `*-soft` status tints, `*-strong` status text, shadows
(black at higher alpha), `overlay`, input/popover/accent.

## Semantic aliases

In **dark only**, legacy names used across feature code (never defined, so they silently dropped)
resolve to real tokens:
`surface-sunken`, `text-primary|main|emphasis|secondary`, `border-subtle|hover`,
`primary-subtle|light`, `danger|success|warning-subtle`, `destructive`, `bg-strong`, `background`.
Prefer the canonical token in new code. They are deliberately not defined in light, so light rendering is unchanged.

## Guardrails

`src/app/styles/tokens.test.ts` fails if any `var(--color-*)` without a fallback is not defined
anywhere, which would otherwise silently drop in both themes.

## Known limits

- Inline `style={{}}` colour props still exist in `features/submissions/**` and
  `AssignmentLessonPlayer.tsx`. They use valid tokens, but should move into CSS modules.
- Office Online embeds (cross-origin iframe) cannot be themed.
- Backend-supplied swatches (permission set `bgColor`) are data and are shown as authored.
