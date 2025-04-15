import { isObject } from '../../utils/guards.js';
import { LogMethodOptions } from '../../utils/log-method-options.js';
import { pluralize } from '../../utils/pluralization.js';
import {
  IInfoOptions,
  ILogOptions,
  ISuccessOptions,
  IWarnOptions,
  LogLabel,
  type IErrorOptions,
  type ILogProvider,
} from '../base.js';
import { Json } from 'detailed-json';

type RequestInit = Exclude<Parameters<typeof fetch>[1], undefined>;

type RequestOptions = {
  baseUrl?: string;
  apiKey?: string;
  channelName?: string;
};

type FetchOptions = Omit<RequestInit, 'body'> &
  Omit<RequestOptions, 'channelName'> & {
    body?: Record<string, unknown>;
  };

type SendMessageOptions = RequestOptions & {
  text: string;
};

type SendUnstyledMessageOptions = RequestOptions & {
  symbol?: string;
  messages: unknown[];
};

type TemplateOptions = {
  title?: string;
  description?: string;
};

export interface IJetBrainsSpaceLogOptions
  extends RequestOptions,
    ILogOptions<TemplateOptions> {}

export interface IJetBrainsSpaceInfoOptions
  extends RequestOptions,
    IInfoOptions<TemplateOptions> {}

export interface IJetBrainsSpaceWarnOptions
  extends RequestOptions,
    IWarnOptions<TemplateOptions> {}

export interface IJetBrainsSpaceErrorOptions
  extends RequestOptions,
    IErrorOptions<TemplateOptions> {}

export interface IJetBrainsSpaceSuccessOptions
  extends RequestOptions,
    ISuccessOptions<TemplateOptions> {}

export type JetBrainsSpaceLogProviderConfig = RequestOptions & {
  enabled?: boolean;
};

/** @deprecated JetBrains Space will no longer be available after June 1, 2025 */
export class JetBrainsSpaceLogProvider implements ILogProvider {
  readonly enabled?: boolean;

  private readonly _baseUrl?: string;
  private readonly _apiKey?: string;
  private readonly _channelName?: string;

  constructor(config?: JetBrainsSpaceLogProviderConfig) {
    this.enabled = config?.enabled;

    this._baseUrl = config?.baseUrl;
    this._apiKey = config?.apiKey;
    this._channelName = config?.channelName;
  }

  async log(options: IJetBrainsSpaceLogOptions | unknown[]) {
    await LogMethodOptions.switch<IJetBrainsSpaceLogOptions>({
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

  async info(options: IJetBrainsSpaceInfoOptions | unknown[]) {
    await LogMethodOptions.switch<IJetBrainsSpaceInfoOptions>({
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

  async warn(options: IJetBrainsSpaceWarnOptions | unknown[]) {
    await LogMethodOptions.switch<IJetBrainsSpaceWarnOptions>({
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

  async error(options: IJetBrainsSpaceErrorOptions | unknown[]) {
    await LogMethodOptions.switch<IJetBrainsSpaceErrorOptions>({
      options,
      unstyled: async (messages, options) => {
        await this._sendUnstyledMessage({
          ...options,
          symbol: ':bangbang:',
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
            `:bangbang: ${title}\n`,
            description && `${description}\n`,
            labels && `${this._buildLabelsRow(labels)}\n`,
            `${this._buildErrorRow(error)}\n`,
            context && this._buildContextRow(context),
          ),
        });
      },
    });
  }

  async success(options: IJetBrainsSpaceSuccessOptions | unknown[]) {
    await LogMethodOptions.switch<IJetBrainsSpaceSuccessOptions>({
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
    const channelName = options?.channelName ?? this._channelName;

    if (!channelName) {
      throw new TypeError('JetBrains Space channel name is not defined');
    }

    const body = {
      channel: `channel:name:${channelName}`,
      content: {
        text: options.text,
        className: 'ChatMessage.Text',
      },
    };

    await this._fetch('/chats/messages/send-message', {
      ...options,
      method: 'POST',
      body,
    });
  }

  private async _fetch(path: string, options?: FetchOptions) {
    const baseUrl = options?.baseUrl ?? this._baseUrl;
    const apiKey = options?.apiKey ?? this._apiKey;

    if (!baseUrl) {
      throw new TypeError('JetBrains Space base URL is not defined');
    }

    if (!apiKey) {
      throw new TypeError('JetBrains Space API key is not defined');
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

  private _buildDuplicatesRow(count: number): string {
    const subject = pluralize(count, 'duplicate', 'duplicates');

    return `\`[ ${count} ${subject} found ]\``;
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
