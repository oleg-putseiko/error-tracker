import { LogMethodOptions } from '../../utils/log-method-options';
import {
  IInfoOptions,
  ILogOptions,
  ISuccessOptions,
  IWarnOptions,
  LogLabel,
  type IErrorOptions,
  type ILogProvider,
} from '../base';
import { Json } from 'detailed-json';

type RequestInit = Exclude<Parameters<typeof fetch>[1], undefined>;

type FetchOptions = Omit<RequestInit, 'body'> & {
  baseUrl?: string;
  apiKey?: string;
  body?: Record<string, unknown>;
};

type SendMessageOptions = {
  channelName?: string;
  text: string;
};

type SendUnstyledMessageOptions = {
  channelName?: string;
  symbol?: string;
  messages: unknown[];
};

type TemplateOptions = {
  title?: string;
  description?: string;
};

interface IRequestOptions {
  botToken?: string;
  chatId?: string;
}

interface IJetbrainsSpaceLogOptions
  extends IRequestOptions,
    ILogOptions<TemplateOptions> {}

interface IJetbrainsSpaceInfoOptions
  extends IRequestOptions,
    IInfoOptions<TemplateOptions> {}

interface IJetbrainsSpaceWarnOptions
  extends IRequestOptions,
    IWarnOptions<TemplateOptions> {}

interface IJetbrainsSpaceErrorOptions
  extends IRequestOptions,
    IErrorOptions<TemplateOptions> {}

interface IJetbrainsSpaceSuccessOptions
  extends IRequestOptions,
    ISuccessOptions<TemplateOptions> {}

type JetbrainsSpaceLogProviderConfig = {
  baseUrl?: string;
  apiKey?: string;
  channelName?: string;
};

/** @deprecated JetBrains Space will no longer be available after June 1, 2025 */
export class JetbrainsSpaceLogProvider implements ILogProvider {
  private readonly _baseUrl?: string;
  private readonly _apiKey?: string;
  private readonly _channelName?: string;

  constructor(config: JetbrainsSpaceLogProviderConfig) {
    this._baseUrl = config.baseUrl;
    this._apiKey = config.apiKey;
    this._channelName = config.channelName;
  }

  async log(options: IJetbrainsSpaceLogOptions) {
    await LogMethodOptions.switch<IJetbrainsSpaceLogOptions>({
      options,
      unstyled: async (messages, options) => {
        await this._sendUnstyledMessage({
          ...options,
          messages,
        });
      },
      styled: async (template, options) => {
        const { title, description, labels, context } = template;

        await this._sendMessage({
          ...options,
          text: this._rows(
            title && `${title}\n`,
            description && `${description}\n`,
            labels && `${this._buildLabelsRow(labels)}\n`,
            context && this._buildContextRow(context),
          ),
        });
      },
    });
  }

  async info(options: IJetbrainsSpaceInfoOptions) {
    await LogMethodOptions.switch<IJetbrainsSpaceInfoOptions>({
      options,
      unstyled: async (messages, options) => {
        await this._sendUnstyledMessage({
          ...options,
          symbol: ':information_source:',
          messages,
        });
      },
      styled: async (template, options) => {
        const {
          title = 'Information',
          description,
          labels,
          context,
        } = template;

        await this._sendMessage({
          ...options,
          text: this._rows(
            `:information_source: ${title}\n`,
            description && `${description}\n`,
            labels && `${this._buildLabelsRow(labels)}\n`,
            context && this._buildContextRow(context),
          ),
        });
      },
    });
  }

  async warn(options: IJetbrainsSpaceWarnOptions) {
    await LogMethodOptions.switch<IJetbrainsSpaceWarnOptions>({
      options,
      unstyled: async (messages, options) => {
        await this._sendUnstyledMessage({
          ...options,
          symbol: ':warning:',
          messages,
        });
      },
      styled: async (template, options) => {
        const { title = 'Warning', description, labels, context } = template;

        await this._sendMessage({
          ...options,
          text: this._rows(
            `:warning: ${title}\n`,
            description && `${description}\n`,
            labels && `${this._buildLabelsRow(labels)}\n`,
            context && this._buildContextRow(context),
          ),
        });
      },
    });
  }

  async error(options: IJetbrainsSpaceErrorOptions) {
    await LogMethodOptions.switch<IJetbrainsSpaceErrorOptions>({
      options,
      unstyled: async (messages, options) => {
        await this._sendUnstyledMessage({
          ...options,
          symbol: ':name_badge:',
          messages,
        });
      },
      styled: async (template, options) => {
        const {
          title = 'An error occurred',
          description,
          labels,
          error,
          context,
        } = template;

        await this._sendMessage({
          ...options,
          text: this._rows(
            `:name_badge: ${title}\n`,
            description && `${description}\n`,
            labels && `${this._buildLabelsRow(labels)}\n`,
            `${this._buildErrorRow(error)}\n`,
            context && this._buildContextRow(context),
          ),
        });
      },
    });
  }

  async success(options: IJetbrainsSpaceSuccessOptions) {
    await LogMethodOptions.switch<IJetbrainsSpaceSuccessOptions>({
      options,
      unstyled: async (messages, options) => {
        await this._sendUnstyledMessage({
          ...options,
          symbol: ':white_check_mark:',
          messages,
        });
      },
      styled: async (template, options) => {
        const { title = 'Success', labels, description, context } = template;

        await this._sendMessage({
          ...options,
          text: this._rows(
            `:white_check_mark: ${title}\n`,
            description && `${description}\n`,
            labels && `${this._buildLabelsRow(labels)}\n`,
            context && this._buildContextRow(context),
          ),
        });
      },
    });
  }

  private async _sendUnstyledMessage(options: SendUnstyledMessageOptions) {
    const { symbol, messages, ...delegatedOptions } = options;

    const stringifiedMessages = messages
      .map((item) => Json.stringify(item))
      .join(' ');

    await this._sendMessage({
      ...delegatedOptions,
      text: symbol ? `${symbol} ${stringifiedMessages}` : stringifiedMessages,
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

  private async _fetch(path: string, options?: FetchOptions) {
    const baseUrl = options?.baseUrl ?? this._baseUrl;
    const apiKey = options?.apiKey ?? this._apiKey;

    if (!baseUrl) {
      throw new TypeError('Jetbrains Space base URL is not defined');
    }

    if (!apiKey) {
      throw new TypeError('Jetbrains Space API key is not defined');
    }

    return await fetch(`${baseUrl}/api/http${path}`, {
      ...options,
      body: options?.body ? Json.stringify(options.body) : undefined,
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

  private _buildLabelsRow(labels: LogLabel[]): string {
    return this._rows(
      ...labels.map((label) => this._buildLabelRow(label.name, label.value)),
    );
  }

  private _buildJsonRow(label: string, value: unknown): string {
    return [
      this._buildLabelRow(label),
      '```json',
      Json.stringify(value),
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
}
