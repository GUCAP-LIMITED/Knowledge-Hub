import { createContext, useContext } from 'react';

/**
 * How many times the user has tried to continue/publish while required items were still missing
 * (`0` = never tried). Required-field UI stays quiet until this is above zero, then reveals its
 * message and replays a shake on every further blocked attempt.
 */
export const SubmitAttemptContext = createContext<number>(0);

export const useSubmitAttempt = (): number => useContext(SubmitAttemptContext);

/** True when a required item is still empty AND the user has already tried to move past it. */
export const useIsFlagged = (invalid: boolean): boolean => {
  const attempt = useSubmitAttempt();
  return invalid && attempt > 0;
};
