/**
 * Compile-time exhaustiveness guard. Put it in the `default`/`else` of an enum switch: if a new
 * variant is added and left unhandled, this stops compiling — bugs caught before runtime.
 */
export const assertNever = (value: never): never => {
  throw new Error(`Unhandled variant: ${JSON.stringify(value)}`);
};
