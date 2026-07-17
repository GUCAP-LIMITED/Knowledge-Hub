import { DomainError } from '@core/errors';

/** Base type for every hierarchy-domain failure. Lets callers catch/switch on intent. */
export abstract class HierarchyError extends DomainError {}

/** The hierarchy API could not be reached or returned an unexpected response. */
export class HierarchyUnavailableError extends HierarchyError {
  public readonly code = 'HIERARCHY_UNAVAILABLE';

  public constructor(cause?: unknown) {
    super('The hierarchy service is currently unavailable. Please try again.', { cause });
  }
}

/** An assign-manager write violated a validator rule (backend 403). Message is user-facing. */
export class HierarchyRuleError extends HierarchyError {
  public readonly code = 'HIERARCHY_RULE_VIOLATION';

  public constructor(message: string) {
    super(message);
  }
}

/** The edge to remove did not exist (backend 404). */
export class HierarchyEdgeNotFoundError extends HierarchyError {
  public readonly code = 'HIERARCHY_EDGE_NOT_FOUND';

  public constructor() {
    super('That reporting line no longer exists.');
  }
}
