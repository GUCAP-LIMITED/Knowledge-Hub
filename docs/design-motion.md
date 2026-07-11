# Motion — tokens & principles

Motion in UAPP Academy is quiet and functional: it explains a change, it never performs.
Everything runs off a tiny shared scale so the app feels like one surface, not fifty.

## Tokens

Defined in [`src/app/styles/global.css`](../src/app/styles/global.css) and mirrored for
Framer Motion in [`shared/ui/motion/presets.ts`](../src/shared/ui/motion/presets.ts):

| Token                  | Value                            | Use for                                    |
| ---------------------- | -------------------------------- | ------------------------------------------ |
| `--motion-fast`        | `0.12s`                          | exits, hover/press feedback, small toggles |
| `--motion-base`        | `0.18s`                          | the default — modals, toasts, backdrops    |
| `--motion-slow`        | `0.28s`                          | larger travel — drawers, progress fills    |
| `--motion-ease-out`    | `cubic-bezier(0.22, 1, 0.36, 1)` | things entering (decelerate into place)    |
| `--motion-ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)`   | things moving/resizing in place            |

## Principles

1. **Enter with `ease-out`, leave with `fast`.** Elements decelerate in and get out of the way
   quickly — never linger on exit.
2. **One scale, everywhere.** Reach for a token, never a raw `0.2s`. A new duration is almost
   always one of these three in disguise.
3. **Animate transform & opacity**, not layout (`width`/`top`) — except a deliberate progress fill.
4. **Motion is a hint, not a show.** Distances are small (≤8px), scales subtle (0.96 → 1). If an
   animation draws attention to itself, it's too much.
5. **Celebrations are the exception** — the success confetti (`Celebration`) is allowed to be
   expressive because it marks an achievement, not a routine state change.
6. **Respect reduced motion.** `prefers-reduced-motion` collapses every token to ~0ms (CSS) and
   `MotionConfig reducedMotion="user"` neutralises the Framer variants. Never bypass this with a
   hardcoded duration.

## Applying it

- **CSS transitions/animations:** `transition: transform var(--motion-slow) var(--motion-ease-out);`
- **Framer Motion:** use the shared `fade` / `fadeUp` / `popIn` variants from `@shared/ui` rather
  than inline `transition` props.
- A raw duration literal (`0.2s`, `300ms`) in a diff is a smell — map it to a token.
