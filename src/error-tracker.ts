import {
  IErrorCaptureOptions,
  IErrorLoggingOptions,
  IErrorTrackProvider,
} from './error-track-provider';

type ExistentialArray<T extends unknown[]> = [...T];

type Providers<TIds extends string[]> = ExistentialArray<{
  [Index in keyof TIds]: IErrorTrackProvider<TIds[Index]>;
}>;

type ProviderOptions<
  TProviderIds extends string[],
  TProviders extends Providers<TProviderIds>,
> = {
  [Index in keyof TProviders]: {
    [Key in TProviders[Index] extends IErrorTrackProvider<string>
      ? TProviders[Index]['id']
      : never]: TProviders[Index] extends IErrorTrackProvider<string>
      ? Partial<Parameters<TProviders[Index]['capture']>[0]>
      : never;
  };
}[keyof TProviders];

type ErrorCaptureOptions<
  TProviderIds extends string[],
  TProviders extends Providers<TProviderIds>,
> = IErrorCaptureOptions & {
  providerOptions?: ProviderOptions<TProviderIds, TProviders>;
};

type ErrorTrackerConfig<
  TProviderIds extends string[],
  TProviders extends Providers<TProviderIds> = Providers<TProviderIds>,
> = IErrorLoggingOptions & {
  providers: TProviders;
};

export class ErrorTracker<
  TProviderIds extends string[],
  TProviders extends Providers<TProviderIds>,
> {
  private readonly _providers: TProviders;
  private readonly _isDebugEnabled: boolean;

  constructor(config: ErrorTrackerConfig<TProviderIds, TProviders>) {
    this._providers = config.providers;
    this._isDebugEnabled = config.debug ?? false;
  }

  async capture(options: ErrorCaptureOptions<TProviderIds, TProviders>) {
    const { error, context, providerOptions } = options;

    const responses = await Promise.allSettled(
      this._providers.map((provider) =>
        provider.capture({
          error,
          context,
          debug: this._isDebugEnabled,
          ...providerOptions?.[provider.id as keyof typeof providerOptions],
        }),
      ),
    );

    for (let index = 0; index < responses.length; index++) {
      const response = responses[index];
      const provider = this._providers[index];
      const options =
        providerOptions?.[provider.id as keyof typeof providerOptions];

      const shouldLog = options?.debug ?? this._isDebugEnabled;

      if (!shouldLog) continue;

      switch (response.status) {
        case 'fulfilled':
          console.info();
          break;

        case 'rejected':
          console.warn();
          break;

        default:
          break;
      }
    }
  }
}
