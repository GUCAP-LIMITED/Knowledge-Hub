import { type Result, ok, err } from '@core/result';
import { InvalidRatingError } from '../errors/review-errors';

const MIN = 1;
const MAX = 5;

/** Star rating value object: a whole number from 1 to 5. Construct via `create`. */
export class Rating {
  public static readonly min = MIN;
  public static readonly max = MAX;

  private constructor(public readonly value: number) {}

  public static create(raw: number): Result<Rating, InvalidRatingError> {
    if (!Number.isInteger(raw) || raw < MIN || raw > MAX) {
      return err(new InvalidRatingError(raw));
    }
    return ok(new Rating(raw));
  }
}
