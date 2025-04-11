import { isObject } from '../utils/guards';
import { LogMethodOptions } from '../utils/log-method-options';
import {
  IInfoOptions,
  ILogOptions,
  ISuccessOptions,
  IWarnOptions,
  LogLabel,
  type IErrorOptions,
  type ILogProvider,
} from './base';
import { Json } from 'detailed-json';

type RequestInit = Exclude<Parameters<typeof fetch>[1], undefined>;

type FetchOptions = Omit<RequestInit, 'body'> & {
  baseUrl?: string;
  apiKey?: string;
  body?: Record<string, unknown>;
};

type SendMessageOptions = {
  channelId?: string;
  baseUrl?: string;
  apiKey?: string;
  text: string;
};

type SendUnstyledMessageOptions = {
  channelId?: string;
  baseUrl?: string;
  apiKey?: string;
  symbol?: string;
  messages: unknown[];
};

type TemplateOptions = {
  title?: string;
  description?: string;
};

interface IRequestOptions {
  channelId?: string;
}

interface IMattermostLogOptions
  extends IRequestOptions,
    ILogOptions<TemplateOptions> {}

interface IMattermostInfoOptions
  extends IRequestOptions,
    IInfoOptions<TemplateOptions> {}

interface IMattermostWarnOptions
  extends IRequestOptions,
    IWarnOptions<TemplateOptions> {}

interface IMattermostErrorOptions
  extends IRequestOptions,
    IErrorOptions<TemplateOptions> {}

interface IMattermostSuccessOptions
  extends IRequestOptions,
    ISuccessOptions<TemplateOptions> {}

type MattermostLogProviderConfig = {
  baseUrl?: string;
  apiKey?: string;
  channelId?: string;
};

export class MattermostLogProvider implements ILogProvider {
  private readonly _baseUrl?: string;
  private readonly _apiKey?: string;
  private readonly _channelId?: string;

  constructor(config: MattermostLogProviderConfig) {
    this._baseUrl = config.baseUrl;
    this._apiKey = config.apiKey;
    this._channelId = config.channelId;
  }

  async log(options: IMattermostLogOptions | unknown[]) {
    await LogMethodOptions.switch<IMattermostLogOptions>({
      options,
      unstyled: async (messages, options) => {
        await this._sendUnstyledMessage({
          ...options,
          messages,
        });
      },
      styled: async (template, options) => {
        const { title, description, labels, context } = template;
        const { numberOfCalls } = options;

        const numberOfDuplicates = numberOfCalls ? numberOfCalls - 1 : 0;

        await this._sendMessage({
          ...options,
          text: this._rows(
            numberOfDuplicates > 0 &&
              `${this._buildDuplicatesRow(numberOfDuplicates)}\n`,
            title && `${title}\n`,
            description && `${description}\n`,
            labels && `${this._buildLabelsRow(labels)}\n`,
            context && this._buildContextRow(context),
          ),
        });
      },
    });
  }

  async info(options: IMattermostInfoOptions | unknown[]) {
    await LogMethodOptions.switch<IMattermostInfoOptions>({
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
        const { numberOfCalls } = options;

        const numberOfDuplicates = numberOfCalls ? numberOfCalls - 1 : 0;

        await this._sendMessage({
          ...options,
          text: this._rows(
            numberOfDuplicates > 0 &&
              `${this._buildDuplicatesRow(numberOfDuplicates)}\n`,
            `:information_source: ${title}\n`,
            description && `${description}\n`,
            labels && `${this._buildLabelsRow(labels)}\n`,
            context && this._buildContextRow(context),
          ),
        });
      },
    });
  }

  async warn(options: IMattermostWarnOptions | unknown[]) {
    await LogMethodOptions.switch<IMattermostWarnOptions>({
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
        const { numberOfCalls } = options;

        const numberOfDuplicates = numberOfCalls ? numberOfCalls - 1 : 0;

        await this._sendMessage({
          ...options,
          text: this._rows(
            numberOfDuplicates > 0 &&
              `${this._buildDuplicatesRow(numberOfDuplicates)}\n`,
            `:warning: ${title}\n`,
            description && `${description}\n`,
            labels && `${this._buildLabelsRow(labels)}\n`,
            context && this._buildContextRow(context),
          ),
        });
      },
    });
  }

  async error(options: IMattermostErrorOptions | unknown[]) {
    await LogMethodOptions.switch<IMattermostErrorOptions>({
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
        const { numberOfCalls } = options;

        const numberOfDuplicates = numberOfCalls ? numberOfCalls - 1 : 0;

        await this._sendMessage({
          ...options,
          text: this._rows(
            numberOfDuplicates > 0 &&
              `${this._buildDuplicatesRow(numberOfDuplicates)}\n`,
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

  async success(options: IMattermostSuccessOptions | unknown[]) {
    await LogMethodOptions.switch<IMattermostSuccessOptions>({
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
        const { numberOfCalls } = options;

        const numberOfDuplicates = numberOfCalls ? numberOfCalls - 1 : 0;

        await this._sendMessage({
          ...options,
          text: this._rows(
            numberOfDuplicates > 0 &&
              `${this._buildDuplicatesRow(numberOfDuplicates)}\n`,
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
      .map((item) => (isObject(item) ? Json.stringify(item) : item))
      .join(' ');

    await this._sendMessage({
      ...delegatedOptions,
      text: symbol ? `${symbol} ${stringifiedMessages}` : stringifiedMessages,
    });
  }

  private async _sendMessage(options: SendMessageOptions) {
    const channelId = options?.channelId ?? this._channelId;

    if (!channelId) {
      throw new TypeError('Mattermost channel id is not defined');
    }

    const body = {
      channel_id: channelId,
      message: options.text,
    };

    await this._fetch('/posts', { method: 'POST', body });
  }

  private async _fetch(path: string, options?: FetchOptions) {
    const baseUrl = options?.baseUrl ?? this._baseUrl;
    const apiKey = options?.apiKey ?? this._apiKey;

    if (!baseUrl) {
      throw new TypeError('Mattermost base URL is not defined');
    }

    if (!apiKey) {
      throw new TypeError('Mattermost API key is not defined');
    }

    return await fetch(`${baseUrl}/api/v4${path}`, {
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

  private _buildDuplicatesRow(count: number): string {
    return `\`[ ${count} duplicates found ]\``;
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
