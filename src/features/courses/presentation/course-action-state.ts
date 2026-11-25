import type { Course } from '../domain';

export interface CourseActionState {
  readonly label: string;
  readonly variant: 'default' | 'ghost';
  readonly disabled: boolean;
}

/** The catalog CTA has exactly 3 states — the business rule behind the card/preview button. */
export const courseActionState = (course: Course): CourseActionState => {
  if (course.isCompleted()) {
    return { label: 'Completed', variant: 'ghost', disabled: true };
  }
  if (course.isEnrolled) {
    return { label: 'Enrolled', variant: 'ghost', disabled: true };
  }
  return { label: 'Enroll', variant: 'default', disabled: false };
};
