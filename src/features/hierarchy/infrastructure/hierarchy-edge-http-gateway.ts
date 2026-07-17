import { type HttpClient, HttpError } from '@core/http';
import type { Logger } from '@core/logger';
import { type Result, ok, err } from '@core/result';
import { z } from 'zod';
import {
  type AssignManagerInput,
  type EdgeKey,
  type HierarchyEdge,
  type HierarchyError,
  type HierarchyGateway,
  type HierarchyNode,
  HierarchyEdgeNotFoundError,
  HierarchyRuleError,
  HierarchyUnavailableError,
} from '../domain';
import {
  HierarchyEdgeDtoSchema,
  HierarchyEdgeListDtoSchema,
  HierarchyTreeDtoSchema,
} from './dto/hierarchy-edge-api.dto';
import { toHierarchyEdge, toHierarchyNode } from './hierarchy-edge-mapper';

const BASE = '/api/app/user-hierarchy';

const ApiErrorSchema = z.object({
  error: z.object({ message: z.string().optional() }).optional(),
});

function apiMessage(body: unknown): string {
  const parsed = ApiErrorSchema.safeParse(body);
  return parsed.success && parsed.data.error?.message ? parsed.data.error.message : '';
}

export interface HierarchyEdgeHttpGatewayDeps {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}

/** HTTP implementation of the {@link HierarchyGateway} port against `/api/app/user-hierarchy`. */
export class HierarchyEdgeHttpGateway implements HierarchyGateway {
  private readonly httpClient: HttpClient;
  private readonly logger: Logger;

  public constructor(deps: HierarchyEdgeHttpGatewayDeps) {
    this.httpClient = deps.httpClient;
    this.logger = deps.logger.child('hierarchy-gateway');
  }

  public async branchTree(
    branchId: string,
  ): Promise<Result<readonly HierarchyNode[], HierarchyError>> {
    try {
      // The branch tree is exposed at the ABSOLUTE route `/branch/{id}/tree` (not under BASE).
      const raw = await this.httpClient.get<unknown>(`/branch/${branchId}/tree`);
      const parsed = HierarchyTreeDtoSchema.safeParse(raw);
      if (!parsed.success) return this.unexpected(parsed.error);
      return ok(parsed.data.map(toHierarchyNode));
    } catch (cause) {
      return err(this.mapError(cause));
    }
  }

  public async edges(
    branchId?: string,
  ): Promise<Result<readonly HierarchyEdge[], HierarchyError>> {
    try {
      const raw = await this.httpClient.get<unknown>(BASE, {
        query: branchId !== undefined ? { branchId } : {},
      });
      const parsed = HierarchyEdgeListDtoSchema.safeParse(raw);
      if (!parsed.success) return this.unexpected(parsed.error);
      return ok(parsed.data.map(toHierarchyEdge));
    } catch (cause) {
      return err(this.mapError(cause));
    }
  }

  public async assignManager(
    input: AssignManagerInput,
  ): Promise<Result<HierarchyEdge, HierarchyError>> {
    try {
      const raw = await this.httpClient.post<unknown>(`${BASE}/assign-manager`, input);
      const parsed = HierarchyEdgeDtoSchema.safeParse(raw);
      if (!parsed.success) return this.unexpected(parsed.error);
      return ok(toHierarchyEdge(parsed.data));
    } catch (cause) {
      return err(this.mapError(cause));
    }
  }

  public async removeOverride(key: EdgeKey): Promise<Result<void, HierarchyError>> {
    try {
      await this.httpClient.delete(`${BASE}/manager-override`, {
        query: {
          subordinateId: key.subordinateId,
          subordinateUserTypeId: key.subordinateUserTypeId,
          branchId: key.branchId,
        },
      });
      return ok(undefined);
    } catch (cause) {
      return err(this.mapError(cause));
    }
  }

  private unexpected(error: z.ZodError): Result<never, HierarchyError> {
    this.logger.error('Hierarchy endpoint returned an unexpected shape', error);
    return err(new HierarchyUnavailableError(error));
  }

  private mapError(cause: unknown): HierarchyError {
    if (cause instanceof HttpError && cause.status === 403) {
      const message = apiMessage(cause.body);
      return new HierarchyRuleError(
        message.length > 0 ? message : 'This assignment is not allowed.',
      );
    }
    if (cause instanceof HttpError && cause.status === 404) {
      return new HierarchyEdgeNotFoundError();
    }
    if (cause instanceof HttpError) {
      this.logger.error('Hierarchy request failed', cause, { status: cause.status });
    } else {
      this.logger.error('Hierarchy request failed', cause);
    }
    return new HierarchyUnavailableError(cause);
  }
}
