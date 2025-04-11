import { Performer } from 'function-performer';
import {
  IErrorOptions,
  ILogProvider,
  IInfoOptions,
  IWarnOptions,
  ILogOptions,
  ISuccessOptions,
  LogLabel,
  IDebugOptions,
  IPerformOptions,
} from './providers/base';
import { isObject } from './utils/guards';

type Providers = Record<string, ILogProvider>;

type DeduplicateOptions = {
  interval: number;
};

type ExecutionOptions = {
  enabled?: boolean;
};

type ProviderOptions<
  TProviders extends Providers,
  TLogKey extends keyof ILogProvider,
> = {
  [_Id in keyof TProviders]?: ExecutionOptions &
    Exclude<
      Parameters<Exclude<TProviders[_Id][TLogKey], undefined>>[0],
      unknown[]
    >;
};

type Unperformed<T extends object> = Omit<T, keyof IPerformOptions>;

type DebugOptions<TProviders extends Providers> = Unperformed<IDebugOptions> & {
  providers?: ProviderOptions<TProviders, 'debug'>;
  deduplicate?: boolean | DeduplicateOptions;
};

type LogOptions<TProviders extends Providers> = Unperformed<ILogOptions> & {
  providers?: ProviderOptions<TProviders, 'log'>;
  deduplicate?: boolean | DeduplicateOptions;
};

type InfoOptions<TProviders extends Providers> = Unperformed<IInfoOptions> & {
  providers?: ProviderOptions<TProviders, 'info'>;
  deduplicate?: boolean | DeduplicateOptions;
};

type WarnOptions<TProviders extends Providers> = Unperformed<IWarnOptions> & {
  providers?: ProviderOptions<TProviders, 'warn'>;
  deduplicate?: boolean | DeduplicateOptions;
};

type ErrorOptions<TProviders extends Providers> = Unperformed<IErrorOptions> & {
  providers?: ProviderOptions<TProviders, 'error'>;
  deduplicate?: boolean | DeduplicateOptions;
};

type SuccessOptions<TProviders extends Providers> =
  Unperformed<ISuccessOptions> & {
    providers?: ProviderOptions<TProviders, 'success'>;
    deduplicate?: boolean | DeduplicateOptions;
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
  deduplicate?: boolean | DeduplicateOptions;
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
  private readonly _performer: Performer;

  private readonly _isEnabled: boolean;
  private readonly _shouldDeduplicate: boolean;

  constructor(config: ErrorTrackerConfig<TProviders>) {
    this._providers = config.providers;

    const deduplicationInterval = isObject(config.deduplicate)
      ? config.deduplicate.interval
      : 100;

    this._performer = new Performer({
      deduplication: { interval: deduplicationInterval },
    });

    this._isEnabled = config.enabled ?? true;
    this._shouldDeduplicate = !!config.deduplicate;
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
    if (this._shouldDeduplicate) {
      this._performer.deduplicate(
        this._dispatchDeduplicatedEvent,
        this,
        method,
        options,
      );
    } else {
      await this._dispatchEvent(method, options);
    }
  }

  private async _dispatchDeduplicatedEvent(
    numberOfCalls: number,
    context: this,
    event: keyof ILogProvider,
    options: ExecuteOptions<TProviders> | unknown[],
  ) {
    const delegatedOptions = Array.isArray(options)
      ? options
      : { ...options, numberOfCalls };

    await context._dispatchEvent(event, delegatedOptions);
  }

  private async _dispatchEvent(
    event: keyof ILogProvider,
    options: ExecuteOptions<TProviders> | unknown[],
  ) {
    await Promise.allSettled(
      Object.entries(this._providers).map(([id, provider]) => {
        if (Array.isArray(options)) {
          if (this._isEnabled) return provider[event]?.(options);
          throw new DisabledProviderError(id);
        }

        const { providers, ...delegatedOptions } = options;

        const providerOptions = providers?.[id];

        if (providerOptions?.enabled ?? this._isEnabled) {
          return provider[event]?.({
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
