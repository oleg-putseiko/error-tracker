import {
  IDebugOptions,
  IInfoOptions,
  ILogOptions,
  ISuccessOptions,
  IWarnOptions,
  type IErrorOptions,
  type ILogProvider,
} from '../../log-provider';

type RequestInit = Exclude<Parameters<typeof fetch>[1], undefined>;

type FetchOptions = Omit<RequestInit, 'body'> & {
  domain?: string;
  apiKey?: string;
  body?: Record<string, unknown>;
};

type SendMessageOptions = {
  channelName?: string;
  text: string;
};

interface IRequestOptions {
  botToken?: string;
  chatId?: string;
}

interface IJetbrainsSpaceLogOptions extends ILogOptions, IRequestOptions {
  title?: string;
  description?: string;
}

interface IJetbrainsSpaceInfoOptions extends IInfoOptions, IRequestOptions {
  title?: string;
  description?: string;
}

interface IJetbrainsSpaceWarnOptions extends IWarnOptions, IRequestOptions {
  title?: string;
  description?: string;
}

interface IJetbrainsSpaceErrorOptions extends IErrorOptions, IRequestOptions {
  title?: string;
  description?: string;
}

interface IJetbrainsSpaceSuccessOptions
  extends ISuccessOptions,
    IRequestOptions {
  title?: string;
  description?: string;
}

type JetbrainsSpaceLogProviderConfig = IDebugOptions & {
  domain?: string;
  apiKey?: string;
  channelName?: string;
};

export class JetbrainsSpaceLogProvider
  implements ILogProvider<'jetbrains_space'>
{
  readonly id = 'jetbrains_space';

  private readonly _domain?: string;
  private readonly _apiKey?: string;
  private readonly _channelName?: string;
  private readonly _isDebugEnabled: boolean;

  constructor(config: JetbrainsSpaceLogProviderConfig) {
    this._domain = config.domain;
    this._apiKey = config.apiKey;
    this._channelName = config.channelName;
    this._isDebugEnabled = config.debug ?? false;
  }

  async log(options: IJetbrainsSpaceLogOptions) {
    const { title, description, context, ...message } = options;

    await this._sendMessage({
      ...message,
      text: this._rows(
        title && `${title}\n`,
        description && `${description}\n`,
        `${this._buildMetadataRow()}\n`,
        context && this._buildContextRow(context),
      ),
    });
  }

  async info(options: IJetbrainsSpaceInfoOptions) {
    const { title = 'Information', description, context, ...message } = options;

    await this._sendMessage({
      ...message,
      text: this._rows(
        `:information_source: ${title}\n`,
        description && `${description}\n`,
        `${this._buildMetadataRow()}\n`,
        context && this._buildContextRow(context),
      ),
    });
  }

  async warn(options: IJetbrainsSpaceWarnOptions) {
    const { title = 'Warning', description, context, ...message } = options;

    await this._sendMessage({
      ...message,
      text: this._rows(
        `:warning: ${title}\n`,
        description && `${description}\n`,
        `${this._buildMetadataRow()}\n`,
        context && this._buildContextRow(context),
      ),
    });
  }

  async error(options: IJetbrainsSpaceErrorOptions) {
    const {
      title = 'An error occurred',
      description,
      error,
      context,
      ...message
    } = options;

    await this._sendMessage({
      ...message,
      text: this._rows(
        `:name_badge: ${title}\n`,
        description && `${description}\n`,
        `${this._buildMetadataRow()}\n`,
        `${this._buildErrorRow(error)}\n`,
        context && this._buildContextRow(context),
      ),
    });
  }

  async success(options: IJetbrainsSpaceSuccessOptions) {
    const { title = 'Success', description, context, ...message } = options;

    await this._sendMessage({
      ...message,
      text: this._rows(
        `:white_check_mark: ${title}\n`,
        description && `${description}\n`,
        `${this._buildMetadataRow()}\n`,
        context && this._buildContextRow(context),
      ),
    });
  }

  private async _sendMessage(options: SendMessageOptions) {
    const channelName = options?.channelName ?? this._channelName;

    if (!channelName) {
      throw new TypeError('Jetbrains Space channel name is not defined');
    }

    const body = {
      channel: `channel:name:${channelName}`,
      content: {
        text: options.text,
        className: 'ChatMessage.Text',
      },
    };

    await this._fetch('/chats/messages/send-message', {
      method: 'POST',
      body,
    });
  }

  private async _fetch(url: string, options?: FetchOptions) {
    const domain = options?.domain ?? this._domain;
    const apiKey = options?.apiKey ?? this._apiKey;

    if (!domain) {
      throw new TypeError('Jetbrains Space organization domain is not defined');
    }

    if (!apiKey) {
      throw new TypeError('Jetbrains Space API key is not defined');
    }

    return await fetch(`https://${domain}/api/http${url}`, {
      ...options,
      body: options?.body ? JSON.stringify(options.body) : undefined,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
  }

  private _buildErrorRow(error: unknown): string {
    return this._buildJsonRow('Error', error);
  }

  private _buildContextRow(context: Record<string, unknown>): string {
    return this._buildJsonRow('Context', context);
  }

  private _buildMetadataRow(): string {
    const environment = process.env.NODE_ENV || 'development';
    const side = typeof window === 'undefined' ? 'server' : 'client';

    return this._rows(
      this._buildLabelRow('Environment', environment),
      this._buildLabelRow('Side', side),
    );
  }

  private _buildJsonRow(label: string, value: unknown): string {
    return [
      this._buildLabelRow(label),
      '```json',
      this._stringify(value),
      '```',
    ].join('\n');
  }

  private _buildLabelRow(title: string, value?: unknown): string {
    if (value === undefined) return `**${title}:**`;
    return `**${title}:** \`${value}\``;
  }

  private _rows(...rows: unknown[]): string {
    return rows.filter(Boolean).join('\n');
  }

  private _stringify(value: unknown): string {
    return JSON.stringify(value, Object.getOwnPropertyNames(value), 4);
  }
}
