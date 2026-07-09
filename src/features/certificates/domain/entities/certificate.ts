/** The grade tiers a certificate can carry. */
export type CertificateGrade = 'Distinction' | 'Merit' | 'Pass';

/** A certificate is treated as "expiring soon" within this many days of its expiry. */
export const EXPIRING_SOON_DAYS = 90;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export interface CertificateProps {
  readonly id: string;
  readonly courseId: string;
  readonly courseName: string;
  readonly userName: string;
  readonly userRole: string;
  readonly issuedDate: Date;
  readonly expiryDate: Date;
  readonly credentialId: string;
  readonly category: string;
  readonly grade: CertificateGrade;
}

/**
 * An issued certificate of completion. Immutable read model — every field is an opaque identifier
 * or display string, so there is no value object to wrap (that would be over-engineering). Business
 * questions ("does this belong to the learner?", "which year was it issued?") are answered by the
 * entity — never by a component or store.
 */
export class Certificate {
  public readonly id: string;
  public readonly courseId: string;
  public readonly courseName: string;
  public readonly userName: string;
  public readonly userRole: string;
  public readonly issuedDate: Date;
  public readonly expiryDate: Date;
  public readonly credentialId: string;
  public readonly category: string;
  public readonly grade: CertificateGrade;

  public constructor(props: CertificateProps) {
    this.id = props.id;
    this.courseId = props.courseId;
    this.courseName = props.courseName;
    this.userName = props.userName;
    this.userRole = props.userRole;
    this.issuedDate = props.issuedDate;
    this.expiryDate = props.expiryDate;
    this.credentialId = props.credentialId;
    this.category = props.category;
    this.grade = props.grade;
  }

  /** True when this certificate was issued to the given learner (case-insensitive). */
  public belongsTo(userName: string): boolean {
    return this.userName.toLowerCase() === userName.toLowerCase();
  }

  /** The calendar year the certificate was issued. */
  public issuedYear(): number {
    return this.issuedDate.getFullYear();
  }

  /** Whole days from `now` until expiry (negative once expired). Time is injected, never read. */
  public daysUntilExpiry(now: Date): number {
    return Math.ceil((this.expiryDate.getTime() - now.getTime()) / MS_PER_DAY);
  }

  /** True when the certificate expires within {@link EXPIRING_SOON_DAYS}. */
  public isExpiringSoon(now: Date): boolean {
    return this.daysUntilExpiry(now) < EXPIRING_SOON_DAYS;
  }

  /** True when this certificate was awarded at the top grade. */
  public isDistinction(): boolean {
    return this.grade === 'Distinction';
  }
}
