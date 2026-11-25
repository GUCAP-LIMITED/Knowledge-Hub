# Responsive breakpoints

There is no `postcss-custom-media` plugin in this build, so a `@media` condition cannot
reference a CSS custom property (`@media (max-width: var(--bp-md))` does not work). The
convention below is a **fixed set of pixel values** every CSS Module should reuse verbatim,
so responsive behaviour stays consistent without a build-time dependency.

## The three tiers

| Tier                                | Value              | Use for…                                                                                                                                                                       |
| ----------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Small (phone)**                   | `max-width: 480px` | Collapsing a 2–3 column stat/summary grid to a single column; tightening padding on cards/modals.                                                                              |
| **Compact (phone/tablet portrait)** | `max-width: 640px` | Collapsing a data `<table>` into stacked cards (see pattern below); stacking a two-column form/detail layout to one column; wrapping a toolbar/search bar vertically.          |
| **Medium (tablet/small laptop)**    | `max-width: 960px` | Dropping a fixed sidebar/detail 2-column page layout (`280px 1fr`, `1.4fr 1fr`, etc.) to a single column; reducing a wide `auto-fill`/`auto-fit` grid's implicit column count. |

`AppLayout`'s sidebar-to-drawer switch is a special case pinned to `720px` (it matches the
sidebar's own width math) — leave it as is; it is not part of this shared scale.

**Do:**

- Reuse `480` / `640` / `960` exactly. Don't invent a nearby value (`820`, `860`, `900`) for a
  new rule — pick the nearest existing tier so behaviour is predictable across pages.
- Prefer `min-width`/`minmax()` auto-flowing grids (`repeat(auto-fill, minmax(240px, 1fr))`)
  over a fixed column count — they need no `@media` override at all in most cases.

**Don't:**

- Add a fourth bespoke breakpoint for one component. If `640`/`960` genuinely don't fit, that's
  a signal the layout itself (not the breakpoint) needs rethinking.

## Pattern: collapsing a `<table>` into cards at 640px

Three tables already use this pattern (`SubmissionsTable`, `TeamProgressPage`,
`UserDirectoryTable`) — copy it rather than inventing a variant. Each `<td>` carries a
`data-label="..."` attribute (empty string for a purely visual/action column); the CSS turns
rows into bordered cards and prints the label via `content: attr(data-label)`:

```css
@media (max-width: 640px) {
  .tableWrap {
    overflow-x: visible;
  }
  .table thead {
    display: none;
  }
  .table,
  .table tbody,
  .table tr,
  .table td {
    display: block;
    width: 100%;
  }
  .tr {
    margin-bottom: 0.75rem;
    padding: 0.35rem 1rem 0.6rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background-color: var(--color-surface);
  }
  .cell {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.5rem 0;
    border-top: 1px solid var(--color-border);
  }
  .cell::before {
    content: attr(data-label);
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }
  .table td:first-child {
    border-top: none;
  }
}
```

A component that renders `data-label` on its `<td>`s without this block is a half-finished
migration, not an intentional choice — finish it.

## Checklist for a feature page

- [ ] Any fixed two-column grid (`Nfr 1fr`, `280px 1fr`) has a `max-width: 960px` override to
      `grid-template-columns: 1fr`.
- [ ] Any `<table>` either uses the card-collapse pattern above at `640px`, or is deliberately
      left as a horizontal-scroll region (`overflow-x: auto` on `.tableWrap`) when the data is
      inherently tabular and collapsing would lose meaning.
- [ ] Toolbars/search bars (`display: flex`) use `flex-wrap: wrap` so controls reflow instead of
      overflowing.
- [ ] A horizontal list of interactive controls that can grow unbounded (tabs, chips, segmented
      controls) has `overflow-x: auto` so it scrolls instead of clipping.
- [ ] Verified in the browser at 375px, 390px, 768px — not just read as CSS.
