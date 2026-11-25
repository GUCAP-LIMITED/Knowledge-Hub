/** Vivid palette for name-derived avatar colors — same set the Leads app uses, so a person's
 * avatar color reads as consistent across both apps. */
const AVATAR_COLORS: readonly string[] = [
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#10B981',
  '#F59E0B',
  '#6366F1',
  '#14B8A6',
  '#EF4444',
  '#0EA5E9',
  '#7C3AED',
];

/** Deterministic color for a person's initials avatar, hashed from their name so the same
 * person always gets the same color and different people are visually distinguishable in a
 * list (table row, team grid, review card) without needing a per-user color to be modeled. */
const FALLBACK_COLOR = '#3B82F6';

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length] ?? FALLBACK_COLOR;
}
