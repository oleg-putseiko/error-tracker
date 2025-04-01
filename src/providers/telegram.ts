import {
  IDebugOptions,
  type IErrorOptions,
  type ILogProvider,
} from '../log-provider';

type RequestInit = Exclude<Parameters<typeof fetch>[1], undefined>;
type FetchOptions = Omit<RequestInit, 'body'> & {
  botToken?: string;
  params?: Record<string, unknown>;
};

type SendMessageOptions = {
  botToken?: string;
  chatId?: string;
  text: string;
};

interface ITelegramErrorOptions extends IErrorOptions {
  botToken?: string;
  chatId?: string;
  title?: string;
}

type TelegramLogProviderConfig = IDebugOptions & {
  botToken?: string;
  chatId?: string;
};

export class TelegramLogProvider implements ILogProvider<'telegram'> {
  readonly id = 'telegram';

  private readonly _botToken?: string;
  private readonly _chatId?: string;
  private readonly _isDebugEnabled: boolean;

  constructor(config: TelegramLogProviderConfig) {
    this._botToken = config.botToken;
    this._chatId = config.chatId;
    this._isDebugEnabled = config.debug ?? false;
  }

  async error(options: ITelegramErrorOptions) {
    const environment = process.env.NODE_ENV || 'development';
    const side = typeof window === 'undefined' ? 'server' : 'client';

    await this._sendMessage({
      ...options,
      text: this._rows(
        `❗️ ${options.title ?? 'An error occurred'}\n`,
        this._labelRow('Environment', environment),
        this._labelRow('Side', side),
        `\n${this._jsonRow('Error', options.error)}`,
        options.context ? this._jsonRow('Context', options.context) : null,
      ),
    });
  }

  private async _sendMessage(options: SendMessageOptions) {
    const botToken = options?.botToken ?? this._botToken;
    const chatId = options.chatId ?? this._chatId;

    if (!botToken) throw new TypeError('Telegram bot token is not defined');

    if (!chatId) throw new TypeError('Telegram chat id is not defined');

    const params = {
      chat_id: chatId,
      parse_mode: 'MarkdownV2',
      text: options.text,
    };

    await this._fetch('/sendMessage', { method: 'POST', params });
  }

  private async _fetch(url: string, options?: FetchOptions) {
    const { params, ...init } = options ?? {};

    const botToken = options?.botToken ?? this._botToken;
    const searchParams = params
      ? `?${this._stringifySearchParams(params)}`
      : '';

    console.log(botToken);

    if (!botToken) throw new TypeError('Telegram bot token is not defined');

    return await fetch(
      `https://api.telegram.org/bot${botToken}${url}${searchParams}`,
      init,
    );
  }

  private _jsonRow(label: string, value: unknown) {
    return [
      this._labelRow(label),
      '```json',
      this._stringify(value),
      '```',
    ].join('\n');
  }

  private _labelRow(title: string, value?: unknown) {
    if (value === undefined) return `**${title}:**`;
    return `**${title}:** \`${value}\``;
  }

  private _rows(...rows: (string | null)[]) {
    return rows.filter(Boolean).join('\n');
  }

  private _stringifySearchParams(params: Record<string, unknown>) {
    return encodeURI(
      Object.entries(params)
        .map(([key, value]) => `${key}=${value}`)
        .join('&'),
    );
  }

  private _stringify(value: unknown) {
    return JSON.stringify(value, Object.getOwnPropertyNames(value));
  }
}
