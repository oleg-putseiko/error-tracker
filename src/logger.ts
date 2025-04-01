import {
  IErrorOptions,
  IDebugOptions,
  ILogProvider,
  IInfoOptions,
  IWarnOptions,
} from './log-provider';

type ExistentialArray<T extends unknown[]> = [...T];

type Providers<TIds extends string[]> = ExistentialArray<{
  [Index in keyof TIds]: ILogProvider<TIds[Index]>;
}>;

type ProviderOptions<
  TProviderIds extends string[],
  TProviders extends Providers<TProviderIds>,
  TLogKey extends 'info' | 'warn' | 'error',
> = {
  [Index in keyof TProviders]: {
    [Key in TProviders[Index] extends ILogProvider<string>
      ? TProviders[Index]['id']
      : never]: TProviders[Index] extends ILogProvider<string>
      ? Partial<Parameters<TProviders[Index][TLogKey]>[0]>
      : never;
  };
}[keyof TProviders];

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

  async info(options: InfoOptions<TProviderIds, TProviders>) {
    const { context, providers } = options;

    await Promise.allSettled(
      this._providers.map((provider) =>
        provider.info({
          context,
          debug: this._isDebugEnabled,
          ...providers?.[provider.id as keyof typeof providers],
        }),
      ),
    );
  }

  async warn(options: WarnOptions<TProviderIds, TProviders>) {
    const { context, providers } = options;

    await Promise.allSettled(
      this._providers.map((provider) =>
        provider.warn({
          context,
          debug: this._isDebugEnabled,
          ...providers?.[provider.id as keyof typeof providers],
        }),
      ),
    );
  }

  async error(options: ErrorOptions<TProviderIds, TProviders>) {
    const { error, context, providers } = options;

    await Promise.allSettled(
      this._providers.map((provider) =>
        provider.error({
          error,
          context,
          debug: this._isDebugEnabled,
          ...providers?.[provider.id as keyof typeof providers],
        }),
      ),
    );
  }
}
