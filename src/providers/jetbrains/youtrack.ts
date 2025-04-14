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
  issueId?: string;
};

type FetchOptions = Omit<RequestInit, 'body'> &
  Omit<RequestOptions, 'issueId'> & {
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

export interface IJetBrainsYouTrackLogOptions
  extends RequestOptions,
    ILogOptions<TemplateOptions> {}

export interface IJetBrainsYouTrackInfoOptions
  extends RequestOptions,
    IInfoOptions<TemplateOptions> {}

export interface IJetBrainsYouTrackWarnOptions
  extends RequestOptions,
    IWarnOptions<TemplateOptions> {}

export interface IJetBrainsYouTrackErrorOptions
  extends RequestOptions,
    IErrorOptions<TemplateOptions> {}

export interface IJetBrainsYouTrackSuccessOptions
  extends RequestOptions,
    ISuccessOptions<TemplateOptions> {}

export type JetBrainsYouTrackLogProviderConfig = RequestOptions & {
  enabled?: boolean;
};

export class JetBrainsYouTrackLogProvider implements ILogProvider {
  readonly enabled?: boolean;

  private readonly _baseUrl?: string;
  private readonly _apiKey?: string;
  private readonly _issueId?: string;

  constructor(config?: JetBrainsYouTrackLogProviderConfig) {
    this.enabled = config?.enabled;

    this._baseUrl = config?.baseUrl;
    this._apiKey = config?.apiKey;
    this._issueId = config?.issueId;
  }

  async log(options: IJetBrainsYouTrackLogOptions | unknown[]) {
    await LogMethodOptions.switch<IJetBrainsYouTrackLogOptions>({
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

  async info(options: IJetBrainsYouTrackInfoOptions | unknown[]) {
    await LogMethodOptions.switch<IJetBrainsYouTrackInfoOptions>({
      options,
      unstyled: async (messages, options) => {
        await this._sendUnstyledMessage({
          ...options,
          symbol: 'ℹ️',
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
            `ℹ️ ${title}\n`,
            description && `${description}\n`,
            labels && `${this._buildLabelsRow(labels)}\n`,
            context && this._buildContextRow(context),
          ),
        });
      },
    });
  }

  async warn(options: IJetBrainsYouTrackWarnOptions | unknown[]) {
    await LogMethodOptions.switch<IJetBrainsYouTrackWarnOptions>({
      options,
      unstyled: async (messages, options) => {
        await this._sendUnstyledMessage({
          ...options,
          symbol: '⚠️',
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
            `⚠️ ${title}\n`,
            description && `${description}\n`,
            labels && `${this._buildLabelsRow(labels)}\n`,
            context && this._buildContextRow(context),
          ),
        });
      },
    });
  }

  async error(options: IJetBrainsYouTrackErrorOptions | unknown[]) {
    await LogMethodOptions.switch<IJetBrainsYouTrackErrorOptions>({
      options,
      unstyled: async (messages, options) => {
        await this._sendUnstyledMessage({
          ...options,
          symbol: '‼️',
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
            `‼️ ${title}\n`,
            description && `${description}\n`,
            labels && `${this._buildLabelsRow(labels)}\n`,
            `${this._buildErrorRow(error)}\n`,
            context && this._buildContextRow(context),
          ),
        });
      },
    });
  }

  async success(options: IJetBrainsYouTrackSuccessOptions | unknown[]) {
    await LogMethodOptions.switch<IJetBrainsYouTrackSuccessOptions>({
      options,
      unstyled: async (messages, options) => {
        await this._sendUnstyledMessage({
          ...options,
          symbol: '✅',
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
            `✅ ${title}\n`,
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
    const issueId = options?.issueId ?? this._issueId;

    if (!issueId) {
      throw new TypeError('JetBrains YouTrack issue id is not defined');
    }

    const body = {
      author: null,
      text: options.text,
    };

    await this._fetch(`/issues/${issueId}/comments`, {
      method: 'POST',
      body,
    });
  }

  private async _fetch(path: string, options?: FetchOptions) {
    const baseUrl = options?.baseUrl ?? this._baseUrl;
    const apiKey = options?.apiKey ?? this._apiKey;

    if (!baseUrl) {
      throw new TypeError('JetBrains YouTrack base URL is not defined');
    }

    if (!apiKey) {
      throw new TypeError('JetBrains YouTrack API key is not defined');
    }

    return await fetch(`${baseUrl}/api${path}`, {
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
