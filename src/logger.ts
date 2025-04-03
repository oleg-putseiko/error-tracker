import {
  IErrorOptions,
  ILogProvider,
  IInfoOptions,
  IWarnOptions,
  ILogOptions,
  ISuccessOptions,
  LogLabel,
  IDebugOptions,
} from './providers/base';

// TODO: change the console log kind colors in the browser

type ExistentialArray<T extends unknown[]> = [...T];

type Providers<TIds extends string[]> = ExistentialArray<{
  [_Index in keyof TIds]: ILogProvider<TIds[_Index]>;
}>;

type CommonProviderOptions = {
  enabled?: boolean;
};

type ProviderOptions<
  TProviderIds extends string[],
  TProviders extends Providers<TProviderIds>,
  TLogKey extends 'debug' | 'log' | 'info' | 'warn' | 'error' | 'success',
> = CommonProviderOptions &
  {
    [_Index in keyof TProviders]: {
      [_Id in TProviders[_Index] extends ILogProvider<string>
        ? TProviders[_Index]['id']
        : never]: TProviders[_Index] extends ILogProvider<string>
        ? TProviders[_Index][TLogKey] extends infer _Method
          ? _Method extends undefined
            ? never
            : _Method extends (options: infer _Options) => any
              ? Partial<_Options>
              : never
          : never
        : never;
    };
  }[number];

type DebugOptions<
  TProviderIds extends string[],
  TProviders extends Providers<TProviderIds>,
> = IDebugOptions & {
  providers?: ProviderOptions<TProviderIds, TProviders, 'debug'>;
};

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
> = {
  providers: TProviders;
  enabled?: boolean;
};

const IS_WINDOW_DEFINED = typeof window !== 'undefined';

export class Logger<
  TProviderIds extends string[],
  TProviders extends Providers<TProviderIds>,
> {
  private readonly _providers: TProviders;
  private readonly _isEnabled: boolean;

  constructor(config: ErrorTrackerConfig<TProviderIds, TProviders>) {
    this._providers = config.providers;
    this._isEnabled = config.enabled ?? true;
  }

  async debug(options: DebugOptions<TProviderIds, TProviders>) {
    const { context, providers } = options;

    await Promise.allSettled(
      this._providers.map((provider) => {
        const providerOptions:
          | (CommonProviderOptions & IDebugOptions)
          | undefined = providers?.[provider.id as keyof typeof providers];

        if (providerOptions?.enabled ?? this._isEnabled) {
          return provider.debug?.({
            context,
            labels: this._getDefaultLabels(),
            ...(providerOptions ?? {}),
          });
        }
      }),
    );
  }

  async log(options: LogOptions<TProviderIds, TProviders>) {
    const { context, providers } = options;

    await Promise.allSettled(
      this._providers.map((provider) => {
        const providerOptions:
          | (CommonProviderOptions & ILogOptions)
          | undefined = providers?.[provider.id as keyof typeof providers];

        if (providerOptions?.enabled ?? this._isEnabled) {
          return provider.log({
            context,
            labels: this._getDefaultLabels(),
            ...(providerOptions ?? {}),
          });
        }
      }),
    );
  }

  async info(options: InfoOptions<TProviderIds, TProviders>) {
    const { context, providers } = options;

    await Promise.allSettled(
      this._providers.map((provider) => {
        const providerOptions:
          | (CommonProviderOptions & IInfoOptions)
          | undefined = providers?.[provider.id as keyof typeof providers];

        if (providerOptions?.enabled ?? this._isEnabled) {
          return provider.info({
            context,
            labels: this._getDefaultLabels(),
            ...(providerOptions ?? {}),
          });
        }
      }),
    );
  }

  async warn(options: WarnOptions<TProviderIds, TProviders>) {
    const { context, providers } = options;

    await Promise.allSettled(
      this._providers.map((provider) => {
        const providerOptions:
          | (CommonProviderOptions & IWarnOptions)
          | undefined = providers?.[provider.id as keyof typeof providers];

        if (providerOptions?.enabled ?? this._isEnabled) {
          return provider.warn({
            context,
            labels: this._getDefaultLabels(),
            ...(providerOptions ?? {}),
          });
        }
      }),
    );
  }

  async error(options: ErrorOptions<TProviderIds, TProviders>) {
    const { error, context, providers } = options;

    await Promise.allSettled(
      this._providers.map((provider) => {
        const providerOptions = providers?.[
          provider.id as keyof typeof providers
        ] as (CommonProviderOptions & IErrorOptions) | undefined;

        if (providerOptions?.enabled ?? this._isEnabled) {
          return provider.error({
            error,
            context,
            labels: this._getDefaultLabels(),
            ...(providerOptions ?? {}),
          });
        }
      }),
    );
  }

  async success(options: SuccessOptions<TProviderIds, TProviders>) {
    const { context, providers } = options;

    await Promise.allSettled(
      this._providers.map((provider) => {
        const providerOptions:
          | (CommonProviderOptions & ISuccessOptions)
          | undefined = providers?.[provider.id as keyof typeof providers];

        if (providerOptions?.enabled ?? this._isEnabled) {
          return provider.success({
            context,
            labels: this._getDefaultLabels(),
            ...(providerOptions ?? {}),
          });
        }
      }),
    );
  }

  private _getDefaultLabels(): LogLabel[] {
    return [
      { name: 'Environment', value: process.env.NODE_ENV || 'development' },
      { name: 'Side', value: IS_WINDOW_DEFINED ? 'client' : 'server' },
    ];
  }
}
