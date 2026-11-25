import type { HttpClient } from '@core/http';
import type { Logger } from '@core/logger';
import type { PlatformSettings, PlatformSettingsGateway } from '../domain';

export interface PlatformSettingsHttpGatewayDeps {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}

export class PlatformSettingsHttpGateway implements PlatformSettingsGateway {
  private readonly _http: HttpClient;
  private readonly _logger: Logger;

  public constructor({ httpClient, logger }: PlatformSettingsHttpGatewayDeps) {
    this._http = httpClient;
    this._logger = logger.child('PlatformSettingsHttpGateway');
  }

  public async getSettings(): Promise<PlatformSettings> {
    this._logger.debug('Fetching platform settings...');
    const result = await this._http.get<PlatformSettings>('/api/app/platform-settings');
    return result;
  }

  public async updateSettings(settings: PlatformSettings): Promise<void> {
    this._logger.debug('Updating platform settings...');
    await this._http.put('/api/app/platform-settings', settings);
  }
}
