import {
  IErrorOptions,
  IDebugOptions,
  ILogProvider,
  IInfoOptions,
  IWarnOptions,
  ILogOptions,
  ISuccessOptions,
  LogLabel,
} from './log-provider';

type ExistentialArray<T extends unknown[]> = [...T];

type Providers<TIds extends string[]> = ExistentialArray<{
  [Index in keyof TIds]: ILogProvider<TIds[Index]>;
}>;

type ProviderOptions<
  TProviderIds extends string[],
  TProviders extends Providers<TProviderIds>,
  TLogKey extends 'log' | 'info' | 'warn' | 'error' | 'success',
> = {
  [Index in keyof TProviders]: {
    [Key in TProviders[Index] extends ILogProvider<string>
      ? TProviders[Index]['id']
      : never]: TProviders[Index] extends ILogProvider<string>
      ? Partial<Parameters<TProviders[Index][TLogKey]>[0]>
      : never;
  };
}[keyof TProviders];

type LogOptions<
  TProviderIds extends string[],
  TProviders extends Providers<TProviderIds>,
> = ILogOptions & {
  providers?: ProviderOptions<TProviderIds, TProviders, 'log'>;
};

type InfoOptions<
  TProviderIds extends string[],
  TProviders extends Providers<TProviderIds>,
> = IInfoOptions & {
  providers?: ProviderOptions<TProviderIds, TProviders, 'info'>;
};

type WarnOptions<
  TProviderIds extends string[],
  TProviders extends Providers<TProviderIds>,
> = IWarnOptions & {
  providers?: ProviderOptions<TProviderIds, TProviders, 'warn'>;
};

type ErrorOptions<
  TProviderIds extends string[],
  TProviders extends Providers<TProviderIds>,
> = IErrorOptions & {
  providers?: ProviderOptions<TProviderIds, TProviders, 'error'>;
};

type SuccessOptions<
  TProviderIds extends string[],
  TProviders extends Providers<TProviderIds>,
> = ISuccessOptions & {
  providers?: ProviderOptions<TProviderIds, TProviders, 'success'>;
};

type ErrorTrackerConfig<
  TProviderIds extends string[],
  TProviders extends Providers<TProviderIds> = Providers<TProviderIds>,
> = IDebugOptions & {
  providers: TProviders;
};

export class Logger<
  TProviderIds extends string[],
  TProviders extends Providers<TProviderIds>,
> {
  private readonly _providers: TProviders;
  private readonly _isDebugEnabled: boolean;

  constructor(config: ErrorTrackerConfig<TProviderIds, TProviders>) {
    this._providers = config.providers;
    this._isDebugEnabled = config.debug ?? false;
  }

  async log(options: LogOptions<TProviderIds, TProviders>) {
    const { context, providers } = options;

    await Promise.allSettled(
      this._providers.map((provider) => {
        const providerOptions =
          providers?.[provider.id as keyof typeof providers];

        return provider.log({
          context,
          debug: this._isDebugEnabled,
          labels: this._getDefaultLabels(),
          ...providerOptions,
        });
      }),
    );
  }

  async info(options: InfoOptions<TProviderIds, TProviders>) {
    const { context, providers } = options;

    await Promise.allSettled(
      this._providers.map((provider) => {
        const providerOptions =
          providers?.[provider.id as keyof typeof providers];

        return provider.info({
          context,
          debug: this._isDebugEnabled,
          labels: this._getDefaultLabels(),
          ...providerOptions,
        });
      }),
    );
  }

  async warn(options: WarnOptions<TProviderIds, TProviders>) {
    const { context, providers } = options;

    await Promise.allSettled(
      this._providers.map((provider) => {
        const providerOptions =
          providers?.[provider.id as keyof typeof providers];

        return provider.warn({
          context,
          debug: this._isDebugEnabled,
          labels: this._getDefaultLabels(),
          ...providerOptions,
        });
      }),
    );
  }

  async error(options: ErrorOptions<TProviderIds, TProviders>) {
    const { error, context, providers } = options;

    await Promise.allSettled(
      this._providers.map((provider) => {
        const providerOptions =
          providers?.[provider.id as keyof typeof providers];

        return provider.error({
          error,
          context,
          debug: this._isDebugEnabled,
          labels: this._getDefaultLabels(),
          ...providerOptions,
        });
      }),
    );
  }

  async success(options: SuccessOptions<TProviderIds, TProviders>) {
    const { context, providers } = options;

    await Promise.allSettled(
      this._providers.map((provider) => {
        const providerOptions =
          providers?.[provider.id as keyof typeof providers];

        return provider.success({
          context,
          debug: this._isDebugEnabled,
          labels: this._getDefaultLabels(),
          ...providerOptions,
        });
      }),
    );
  }

  private _getDefaultLabels(): LogLabel[] {
    return [
      { name: 'Environment', value: process.env.NODE_ENV || 'development' },
      {
        name: 'Side',
        value: typeof window === 'undefined' ? 'server' : 'client',
      },
    ];
  }
}
