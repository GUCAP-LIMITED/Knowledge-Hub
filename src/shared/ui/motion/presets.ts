import type { Variants } from 'motion/react';

/**
 * Reusable, subtle motion variants. Kept tiny and token-aligned so transitions stay consistent
 * across primitives. `MotionConfig reducedMotion="user"` (mounted in the app shell) makes these
 * respect the user's reduced-motion preference automatically.
 */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.18, ease: 'easeOut' } },
  exit: { opacity: 0, y: 4, transition: { duration: 0.12, ease: 'easeIn' } },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.16, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.12, ease: 'easeIn' } },
};

export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.16, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.12, ease: 'easeIn' } },
};
