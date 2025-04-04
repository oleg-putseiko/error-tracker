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

type Providers = Record<string, ILogProvider>;

type CommonProviderOptions = {
  enabled?: boolean;
};

type ProviderOptions<
  TProviders extends Providers,
  TLogKey extends keyof ILogProvider,
> = {
  [_Id in keyof TProviders]: TProviders[_Id][TLogKey] extends (
    options: infer _MethodOptions,
  ) => any
    ? CommonProviderOptions & _MethodOptions
    : never;
};

type DebugOptions<TProviders extends Providers> = IDebugOptions & {
  providers?: ProviderOptions<TProviders, 'debug'>;
};

type LogOptions<TProviders extends Providers> = ILogOptions & {
  providers?: ProviderOptions<TProviders, 'log'>;
};

type InfoOptions<TProviders extends Providers> = IInfoOptions & {
  providers?: ProviderOptions<TProviders, 'info'>;
};

type WarnOptions<TProviders extends Providers> = IWarnOptions & {
  providers?: ProviderOptions<TProviders, 'warn'>;
};

type ErrorOptions<TProviders extends Providers> = IErrorOptions & {
  providers?: ProviderOptions<TProviders, 'error'>;
};

type SuccessOptions<TProviders extends Providers> = ISuccessOptions & {
  providers?: ProviderOptions<TProviders, 'success'>;
};

type ErrorTrackerConfig<TProviders extends Providers> = {
  providers: TProviders;
  enabled?: boolean;
};

const IS_WINDOW_DEFINED = typeof window !== 'undefined';

export class Logger<TProviders extends Providers> {
  private readonly _providers: TProviders;
  private readonly _isEnabled: boolean;

  constructor(config: ErrorTrackerConfig<TProviders>) {
    this._providers = config.providers;
    this._isEnabled = config.enabled ?? true;
  }

  async debug(options: DebugOptions<TProviders>) {
    const { context, providers } = options;

    await Promise.allSettled(
      Object.entries(this._providers).map(([id, provider]) => {
        const providerOptions = providers?.[id];

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

  async log(options: LogOptions<TProviders>) {
    const { context, providers } = options;

    await Promise.allSettled(
      Object.entries(this._providers).map(([id, provider]) => {
        const providerOptions = providers?.[id];

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

  async info(options: InfoOptions<TProviders>) {
    const { context, providers } = options;

    await Promise.allSettled(
      Object.entries(this._providers).map(([id, provider]) => {
        const providerOptions = providers?.[id];

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

  async warn(options: WarnOptions<TProviders>) {
    const { context, providers } = options;

    await Promise.allSettled(
      Object.entries(this._providers).map(([id, provider]) => {
        const providerOptions = providers?.[id];

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

  async error(options: ErrorOptions<TProviders>) {
    const { error, context, providers } = options;

    await Promise.allSettled(
      Object.entries(this._providers).map(([id, provider]) => {
        const providerOptions = providers?.[id];

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

  async success(options: SuccessOptions<TProviders>) {
    const { context, providers } = options;

    await Promise.allSettled(
      Object.entries(this._providers).map(([id, provider]) => {
        const providerOptions = providers?.[id];

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
