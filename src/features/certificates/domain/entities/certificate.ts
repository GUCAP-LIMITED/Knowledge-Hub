export interface CertificateProps {
  readonly id: string;
  readonly courseId: string;
  readonly courseName: string;
  readonly userName: string;
  readonly userRole: string;
  readonly issuedDate: Date;
  readonly credentialId: string;
  readonly category: string;
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
  public readonly credentialId: string;
  public readonly category: string;

  public constructor(props: CertificateProps) {
    this.id = props.id;
    this.courseId = props.courseId;
    this.courseName = props.courseName;
    this.userName = props.userName;
    this.userRole = props.userRole;
    this.issuedDate = props.issuedDate;
    this.credentialId = props.credentialId;
    this.category = props.category;
  }

  /** True when this certificate was issued to the given learner (case-insensitive). */
  public belongsTo(userName: string): boolean {
    return this.userName.toLowerCase() === userName.toLowerCase();
  }

  /** The calendar year the certificate was issued. */
  public issuedYear(): number {
    return this.issuedDate.getFullYear();
  }
}
