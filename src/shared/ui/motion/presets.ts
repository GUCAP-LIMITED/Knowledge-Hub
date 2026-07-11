import type { Variants } from 'motion/react';

/**
 * Reusable, subtle motion variants. Durations mirror the CSS motion tokens in `global.css`
 * (see docs/design-motion.md) so JS- and CSS-driven motion stay in lockstep.
 * `MotionConfig reducedMotion="user"` (mounted in the app shell) makes these respect the
 * user's reduced-motion preference automatically.
 */
const DURATION = {
  fast: 0.12,
  base: 0.18,
  slow: 0.28,
} as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: 'easeOut' } },
  exit: { opacity: 0, y: 4, transition: { duration: DURATION.fast, ease: 'easeIn' } },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.base, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: { duration: DURATION.fast, ease: 'easeIn' },
  },
};

export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATION.base, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: DURATION.fast, ease: 'easeIn' } },
};
