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
  [_Id in keyof TProviders]?: CommonProviderOptions &
    Exclude<
      Parameters<Exclude<TProviders[_Id][TLogKey], undefined>>[0],
      unknown[]
    >;
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

type ExecuteOptions<TProviders extends Providers> =
  | DebugOptions<TProviders>
  | LogOptions<TProviders>
  | InfoOptions<TProviders>
  | WarnOptions<TProviders>
  | ErrorOptions<TProviders>
  | SuccessOptions<TProviders>;

type ErrorTrackerConfig<TProviders extends Providers> = {
  providers: TProviders;
  enabled?: boolean;
};

const IS_WINDOW_DEFINED = typeof window !== 'undefined';

class DisabledProviderError extends Error {
  constructor(providerId: string) {
    super(`Log provider with id "${providerId}" is disabled.`);

    this.name = 'DisabledProviderError';
  }
}

export class Logger<TProviders extends Providers> {
  private readonly _providers: TProviders;
  private readonly _isEnabled: boolean;

  constructor(config: ErrorTrackerConfig<TProviders>) {
    this._providers = config.providers;
    this._isEnabled = config.enabled ?? true;
  }

  async debug(options: DebugOptions<TProviders> | unknown[]) {
    await this._execute('debug', options);
  }

  async log(options: LogOptions<TProviders> | unknown[]) {
    await this._execute('log', options);
  }

  async info(options: InfoOptions<TProviders> | unknown[]) {
    await this._execute('info', options);
  }

  async warn(options: WarnOptions<TProviders> | unknown[]) {
    await this._execute('warn', options);
  }

  async error(options: ErrorOptions<TProviders> | unknown[]) {
    await this._execute('error', options);
  }

  async success(options: SuccessOptions<TProviders> | unknown[]) {
    await this._execute('success', options);
  }

  private async _execute(
    method: keyof ILogProvider,
    options: ExecuteOptions<TProviders> | unknown[],
  ) {
    await Promise.allSettled(
      Object.entries(this._providers).map(([id, provider]) => {
        if (Array.isArray(options)) {
          if (this._isEnabled) return provider[method]?.(options);
          throw new DisabledProviderError(id);
        }

        const { providers, ...delegatedOptions } = options;

        const providerOptions = providers?.[id];

        if (providerOptions?.enabled ?? this._isEnabled) {
          return provider[method]?.({
            ...delegatedOptions,
            ...providerOptions,
            template: {
              labels: this._getDefaultLabels(),
              ...delegatedOptions.template,
              ...providerOptions?.template,
            },
          });
        }

        throw new DisabledProviderError(id);
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
