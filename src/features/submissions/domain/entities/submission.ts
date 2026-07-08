import { type Result, ok, err } from '@core/result';
import {
  type SubmissionError,
  InvalidSubmissionTransitionError,
} from '../errors/submission-errors';
import type { RejectionReason } from '../value-objects/rejection-reason';

/** The review lifecycle a submission moves through. */
export type SubmissionStatus =
  | 'pending'
  | 'review'
  | 'approved'
  | 'published'
  | 'rejected';

export interface SubmissionProps {
  readonly id: string;
  readonly title: string;
  readonly type: string;
  readonly submittedBy: string;
  readonly submittedAt: Date;
  readonly status: SubmissionStatus;
  /** Reviewer note or rejection reason; `null` until a reviewer acts. */
  readonly note: string | null;
}

/**
 * Aggregate root of the review workflow. The submission owns its own state machine — every
 * transition validates the current status and returns a `Result`, so no store or component can
 * push it into an illegal state ("tell, don't ask"). Immutable: a transition returns a new instance.
 *
 * Allowed transitions:
 *   pending ──flagForReview──▶ review
 *   pending | review ──approve──▶ approved ──publish──▶ published
 *   pending | review ──reject──▶ rejected
 */
export class Submission {
  public readonly id: string;
  public readonly title: string;
  public readonly type: string;
  public readonly submittedBy: string;
  public readonly submittedAt: Date;
  public readonly status: SubmissionStatus;
  public readonly note: string | null;

  public constructor(props: SubmissionProps) {
    this.id = props.id;
    this.title = props.title;
    this.type = props.type;
    this.submittedBy = props.submittedBy;
    this.submittedAt = props.submittedAt;
    this.status = props.status;
    this.note = props.note;
  }

  /** Awaiting a reviewer decision (still actionable in the queue). */
  public awaitsDecision(): boolean {
    return this.status === 'pending' || this.status === 'review';
  }

  /** Reached a terminal state (no further transitions). */
  public isFinal(): boolean {
    return this.status === 'published' || this.status === 'rejected';
  }

  /** Move a pending submission into deeper review. */
  public flagForReview(): Result<Submission, SubmissionError> {
    if (this.status !== 'pending') {
      return err(new InvalidSubmissionTransitionError(this.status, 'flag for review'));
    }
    return ok(this.copyWith({ status: 'review' }));
  }

  /** Approve a submission awaiting decision. An optional reviewer note may be attached. */
  public approve(note?: string): Result<Submission, SubmissionError> {
    if (!this.awaitsDecision()) {
      return err(new InvalidSubmissionTransitionError(this.status, 'approve'));
    }
    const trimmed = note?.trim();
    return ok(
      this.copyWith({
        status: 'approved',
        note: trimmed !== undefined && trimmed.length > 0 ? trimmed : this.note,
      }),
    );
  }

  /** Reject a submission awaiting decision. The reason is a validated value object. */
  public reject(reason: RejectionReason): Result<Submission, SubmissionError> {
    if (!this.awaitsDecision()) {
      return err(new InvalidSubmissionTransitionError(this.status, 'reject'));
    }
    return ok(this.copyWith({ status: 'rejected', note: reason.value }));
  }

  /** Publish an approved submission so learners can see it. */
  public publish(): Result<Submission, SubmissionError> {
    if (this.status !== 'approved') {
      return err(new InvalidSubmissionTransitionError(this.status, 'publish'));
    }
    return ok(this.copyWith({ status: 'published' }));
  }

  private copyWith(patch: Partial<SubmissionProps>): Submission {
    return new Submission({ ...this.toProps(), ...patch });
  }

  private toProps(): SubmissionProps {
    return {
      id: this.id,
      title: this.title,
      type: this.type,
      submittedBy: this.submittedBy,
      submittedAt: this.submittedAt,
      status: this.status,
      note: this.note,
    };
  }
}
