import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
} from 'react';
import { createPortal } from 'react-dom';
import { cn, usePrefersReducedMotion } from '@shared/utils';
import styles from './Celebration.module.css';

const PIECE_COUNT = 32;
const DURATION_MS = 1700;

interface Piece {
  readonly left: number;
  readonly delayMs: number;
  readonly durationMs: number;
  readonly rotate: number;
  readonly drift: number;
  readonly tone: number;
}

/** Deterministic pseudo-random so the burst looks scattered without re-shuffling on every render. */
const buildPieces = (): readonly Piece[] =>
  Array.from({ length: PIECE_COUNT }, (_unused, index) => {
    const rand = (seed: number): number =>
      ((index * 9301 + seed * 49297) % 233280) / 233280;
    return {
      left: Math.round(rand(1) * 100),
      delayMs: Math.round(rand(2) * 350),
      durationMs: 1150 + Math.round(rand(3) * 450),
      rotate: Math.round((rand(4) - 0.5) * 720),
      drift: Math.round((rand(5) - 0.5) * 140),
      tone: index % 5,
    };
  });

const PIECES = buildPieces();

export interface CelebrationProps {
  /** Rising edge (false → true, or mounting already true) fires one confetti burst. */
  readonly show: boolean;
}

/** A one-shot confetti burst for success moments. Renders nothing when reduced motion is preferred. */
export const Celebration = ({ show }: CelebrationProps): ReactElement | null => {
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(false);
  const wasShown = useRef(false);

  useEffect(() => {
    if (show && !wasShown.current) setActive(true);
    wasShown.current = show;
  }, [show]);

  useEffect(() => {
    if (!active) return undefined;
    const id = window.setTimeout(() => {
      setActive(false);
    }, DURATION_MS);
    return () => {
      window.clearTimeout(id);
    };
  }, [active]);

  if (!active || reduced) return null;

  return createPortal(
    <div className={styles.overlay} aria-hidden="true">
      {PIECES.map((piece, index) => (
        <span
          key={`piece-${String(index)}`}
          className={cn(styles.piece, styles[`tone${String(piece.tone)}`])}
          style={
            {
              '--left': `${String(piece.left)}%`,
              '--delay': `${String(piece.delayMs)}ms`,
              '--duration': `${String(piece.durationMs)}ms`,
              '--rotate': `${String(piece.rotate)}deg`,
              '--drift': `${String(piece.drift)}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>,
    document.body,
  );
};
