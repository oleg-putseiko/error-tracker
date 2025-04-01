import { IErrorOptions, IDebugOptions, ILogProvider } from './log-provider';
import { TelegramLogProvider } from './providers/telegram';

type ExistentialArray<T extends unknown[]> = [...T];

type Providers<TIds extends string[]> = ExistentialArray<{
  [Index in keyof TIds]: ILogProvider<TIds[Index]>;
}>;

type ProviderOptions<
  TProviderIds extends string[],
  TProviders extends Providers<TProviderIds>,
> = {
  [Index in keyof TProviders]: {
    [Key in TProviders[Index] extends ILogProvider<string>
      ? TProviders[Index]['id']
      : never]: TProviders[Index] extends ILogProvider<string>
      ? Partial<Parameters<TProviders[Index]['error']>[0]>
      : never;
  };
}[keyof TProviders];

type ErrorOptions<
  TProviderIds extends string[],
  TProviders extends Providers<TProviderIds>,
> = IErrorOptions & {
  providerOptions?: ProviderOptions<TProviderIds, TProviders>;
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

  async error(options: ErrorOptions<TProviderIds, TProviders>) {
    const { error, context, providerOptions } = options;

    const responses = await Promise.allSettled(
      this._providers.map((provider) =>
        provider.error({
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
          console.info('Success');
          break;

        case 'rejected':
          console.warn('Error');
          break;

        default:
          break;
      }
    }
  }
}

const logger = new Logger({
  debug: true,
  providers: [
    new TelegramLogProvider({
      botToken: '7536052994:AAEwD6mzydpgJIi3eYIS2rgJ1OPOSXPPv30',
      chatId: '-1002536352967',
    }),
  ],
});

logger
  .error({
    error: new Error('qwe'),
    context: {
      qwe: 'asd',
    },
  })
  .catch(console.error)
  .then(console.log);
