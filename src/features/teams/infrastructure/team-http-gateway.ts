import { type HttpClient, HttpError } from '@core/http';
import type { Logger } from '@core/logger';
import { z } from 'zod';
import type {
  CreateTeamInput,
  SelectableUserType,
  Team,
  TeamGateway,
  UpdateTeamInput,
} from '../domain';
import {
  TeamDtoSchema,
  TeamListDtoSchema,
  TeamUserTypeOptionSchema,
} from './dto/team-api.dto';
import { toSelectableUserType, toTeam } from './team-mapper';

const BASE = '/api/app/team';

export interface TeamHttpGatewayDeps {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}

/** HTTP adapter for the Team API. Unwraps the ABP error envelope into a plain Error message. */
export class TeamHttpGateway implements TeamGateway {
  private readonly httpClient: HttpClient;
  private readonly logger: Logger;

  public constructor(deps: TeamHttpGatewayDeps) {
    this.httpClient = deps.httpClient;
    this.logger = deps.logger.child('team-gateway');
  }

  public async list(): Promise<readonly Team[]> {
    return this.call(async () => {
      const raw = await this.httpClient.get<unknown>(BASE, {
        query: { maxResultCount: 200 },
      });
      return TeamListDtoSchema.parse(raw).items.map(toTeam);
    });
  }

  public async create(input: CreateTeamInput): Promise<Team> {
    return this.call(async () =>
      toTeam(TeamDtoSchema.parse(await this.httpClient.post(BASE, input))),
    );
  }

  public async update(id: string, input: UpdateTeamInput): Promise<Team> {
    return this.call(async () =>
      toTeam(TeamDtoSchema.parse(await this.httpClient.put(`${BASE}/${id}`, input))),
    );
  }

  public async remove(id: string): Promise<void> {
    await this.call(async () => {
      await this.httpClient.delete(`${BASE}/${id}`);
    });
  }

  public async selectableUserTypes(): Promise<readonly SelectableUserType[]> {
    return this.call(async () => {
      const raw = await this.httpClient.get<unknown[]>(`${BASE}/selectable-user-types`);
      return z.array(TeamUserTypeOptionSchema).parse(raw).map(toSelectableUserType);
    });
  }

  private async call<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (cause) {
      throw new Error(this.messageFor(cause));
    }
  }

  private messageFor(cause: unknown): string {
    if (cause instanceof HttpError) {
      const body = cause.body as { error?: { message?: string } } | undefined;
      const message = body?.error?.message;
      this.logger.error('Team request failed', cause, { status: cause.status });
      return message !== undefined && message.length > 0
        ? message
        : `Request failed (${String(cause.status)}).`;
    }
    this.logger.error('Team request failed', cause);
    return cause instanceof Error ? cause.message : 'Something went wrong.';
  }
}
