export type ClassValue = string | false | null | undefined;

/** Join conditional class names. Falsy values are dropped. */
export const cn = (...values: ClassValue[]): string =>
  values.filter((value): value is string => Boolean(value)).join(' ');
