export interface PlatformSettings {
  readonly publicSignup: boolean;
  readonly publicCatalog: boolean;
  readonly approval: boolean;
  readonly selfEnrol: boolean;
  readonly autoCertificates: boolean;
  readonly ratings: boolean;
  readonly reminders: boolean;
  readonly email: boolean;
}

export interface PlatformSettingsGateway {
  getSettings(): Promise<PlatformSettings>;
  updateSettings(settings: PlatformSettings): Promise<void>;
}
