import { type HttpClient, HttpError } from '@core/http';
import type { Logger } from '@core/logger';
import { type Result, ok, err } from '@core/result';
import { z } from 'zod';
import {
  type DashboardError,
  type DashboardGateway,
  type DashboardView,
  type SaveTemplateInput,
  type SaveWidget,
  type WidgetCatalogItem,
  type WidgetData,
  type WidgetDataRequest,
  DashboardOperationError,
  DashboardUnavailableError,
} from '../domain';
import {
  DashboardDtoSchema,
  DashboardOrNullDtoSchema,
  WidgetCatalogDtoSchema,
  WidgetDataDtoSchema,
} from './dto/dashboard-view-api.dto';
import {
  periodToInt,
  toDashboardView,
  toWidgetCatalogItem,
  toWidgetData,
} from './dashboard-view-mapper';

const BASE = '/api/app/dashboard';

const ApiErrorSchema = z.object({
  error: z.object({ message: z.string().optional() }).optional(),
});

function apiMessage(body: unknown): string {
  const parsed = ApiErrorSchema.safeParse(body);
  return parsed.success && parsed.data.error?.message ? parsed.data.error.message : '';
}

export interface DashboardViewHttpGatewayDeps {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}

/** HTTP implementation of the {@link DashboardGateway} port against `/api/app/dashboard`. */
export class DashboardViewHttpGateway implements DashboardGateway {
  private readonly httpClient: HttpClient;
  private readonly logger: Logger;

  public constructor(deps: DashboardViewHttpGatewayDeps) {
    this.httpClient = deps.httpClient;
    this.logger = deps.logger.child('dashboard-gateway');
  }

  public async myDashboard(): Promise<Result<DashboardView | null, DashboardError>> {
    return this.read(`${BASE}/me`, DashboardOrNullDtoSchema, (d) =>
      d === null ? null : toDashboardView(d),
    );
  }

  public async widgetData(
    request: WidgetDataRequest,
  ): Promise<Result<WidgetData, DashboardError>> {
    return this.write(
      () =>
        this.httpClient.post<unknown>(`${BASE}/widget-data`, {
          widgetKey: request.widgetKey,
          config: request.config,
          period: periodToInt(request.period),
        }),
      WidgetDataDtoSchema,
      toWidgetData,
    );
  }

  public async catalog(): Promise<Result<readonly WidgetCatalogItem[], DashboardError>> {
    return this.read(`${BASE}/widget-catalog`, WidgetCatalogDtoSchema, (d) =>
      d.map(toWidgetCatalogItem),
    );
  }

  public async saveMine(
    widgets: readonly SaveWidget[],
  ): Promise<Result<DashboardView, DashboardError>> {
    return this.write(
      () => this.httpClient.put<unknown>(`${BASE}/my`, { widgets }),
      DashboardDtoSchema,
      toDashboardView,
    );
  }

  public async resetMine(): Promise<Result<void, DashboardError>> {
    return this.voidWrite(() => this.httpClient.delete(`${BASE}/my`));
  }

  public async byUserType(
    userTypeId: string,
  ): Promise<Result<DashboardView | null, DashboardError>> {
    try {
      const raw = await this.httpClient.get<unknown>(
        `${BASE}/by-user-type/${userTypeId}`,
      );
      const parsed = DashboardDtoSchema.safeParse(raw);
      if (!parsed.success) return this.unexpected(parsed.error);
      return ok(toDashboardView(parsed.data));
    } catch (cause) {
      if (cause instanceof HttpError && cause.status === 404) return ok(null);
      return err(this.mapError(cause));
    }
  }

  public async saveTemplate(
    input: SaveTemplateInput,
  ): Promise<Result<DashboardView, DashboardError>> {
    return this.write(
      () => this.httpClient.post<unknown>(BASE, input),
      DashboardDtoSchema,
      toDashboardView,
    );
  }

  public async resetUser(userId: string): Promise<Result<void, DashboardError>> {
    return this.voidWrite(() => this.httpClient.delete(`${BASE}/user/${userId}`));
  }

  private async read<TIn, TOut>(
    path: string,
    schema: z.ZodType<TIn>,
    map: (data: TIn) => TOut,
  ): Promise<Result<TOut, DashboardError>> {
    return this.write(() => this.httpClient.get<unknown>(path), schema, map);
  }

  private async write<TIn, TOut>(
    call: () => Promise<unknown>,
    schema: z.ZodType<TIn>,
    map: (data: TIn) => TOut,
  ): Promise<Result<TOut, DashboardError>> {
    try {
      const parsed = schema.safeParse(await call());
      if (!parsed.success) return this.unexpected(parsed.error);
      return ok(map(parsed.data));
    } catch (cause) {
      return err(this.mapError(cause));
    }
  }

  private async voidWrite(
    call: () => Promise<unknown>,
  ): Promise<Result<void, DashboardError>> {
    try {
      await call();
      return ok(undefined);
    } catch (cause) {
      return err(this.mapError(cause));
    }
  }

  private unexpected(error: z.ZodError): Result<never, DashboardError> {
    this.logger.error('Dashboard endpoint returned an unexpected shape', error);
    return err(new DashboardUnavailableError(error));
  }

  private mapError(cause: unknown): DashboardError {
    if (cause instanceof HttpError && (cause.status === 400 || cause.status === 403)) {
      const message = apiMessage(cause.body);
      if (message.length > 0) return new DashboardOperationError(message);
    }
    if (cause instanceof HttpError) {
      this.logger.error('Dashboard request failed', cause, { status: cause.status });
    } else {
      this.logger.error('Dashboard request failed', cause);
    }
    return new DashboardUnavailableError(cause);
  }
}
