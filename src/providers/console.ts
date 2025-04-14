import { Json } from 'detailed-json';
import {
  IDebugOptions,
  IInfoOptions,
  ILogOptions,
  ISuccessOptions,
  IWarnOptions,
  LogLabel,
  type IErrorOptions,
  type ILogProvider,
} from './base.js';
import { LogMethodOptions } from '../utils/log-method-options.js';

enum TerminalTextColor {
  BlueBold = '\x1b[1;34m',
  Gray = '\x1b[90m',
  GreenBold = '\x1b[1;32m',
  Magenta = '\x1b[35m',
  RedBold = '\x1b[1;31m',
  Unset = '\x1b[0m',
  YellowBold = '\x1b[1;33m',
}

type ClientLabelStyles = {
  backgroundColor: string;
  borderColor: string;
};

type TerminalLabelStyles = {
  textColor: TerminalTextColor;
};

type LabelStyles = {
  client: ClientLabelStyles;
  terminal: TerminalLabelStyles;
};

type LogKindDetails = {
  value: string;
  styles: LabelStyles;
};

type TitleMessagesData = {
  kind?: LogKindDetails;
  labels?: LogLabel[];
};

type TemplateOptions = {
  text?: string;
};

export interface IConsoleDebugOptions extends IDebugOptions<TemplateOptions> {}

export interface IConsoleLogOptions extends ILogOptions<TemplateOptions> {}

export interface IConsoleInfoOptions extends IInfoOptions<TemplateOptions> {}

export interface IConsoleWarnOptions extends IWarnOptions<TemplateOptions> {}

export interface IConsoleErrorOptions extends IErrorOptions<TemplateOptions> {}

export interface IConsoleSuccessOptions
  extends ISuccessOptions<TemplateOptions> {}

export type ConsoleLogProviderConfig = {
  enabled?: boolean;
};

const __PARAGRAPH_SYMBOL__: unique symbol = Symbol();

const SPECIAL_SYMBOLS = [__PARAGRAPH_SYMBOL__];

const IS_WINDOW_DEFINED = typeof window !== 'undefined';

export class ConsoleLogProvider implements ILogProvider {
  readonly enabled?: boolean;

  constructor(config?: ConsoleLogProviderConfig) {
    this.enabled = config?.enabled;
  }

  debug(options: IConsoleDebugOptions | unknown[]) {
    const kind: LogKindDetails = {
      value: 'debug',
      styles: {
        client: {
          backgroundColor: 'rgba(200, 160, 217, 0.5)',
          borderColor: 'rgb(182, 149, 191)',
        },
        terminal: {
          textColor: TerminalTextColor.Magenta,
        },
      },
    };

    LogMethodOptions.switch<IConsoleDebugOptions>({
      options,
      unstyled: (messages) => {
        const kindMessages = this._buildTitleMessages({ kind });

        console.debug(...kindMessages, ...messages);
      },
      styled: (template) => {
        const { labels, text, context } = template;

        const titleMessages = this._buildTitleMessages({ kind, labels });

        const contextMessages = context
          ? this._buildContextMessages(context)
          : [];

        const messages = this._formatMessages(
          ...titleMessages,
          text,
          __PARAGRAPH_SYMBOL__,
          ...contextMessages,
        );

        console.debug(...messages);
      },
    });
  }

  log(options: IConsoleLogOptions | unknown[]) {
    LogMethodOptions.switch<IConsoleLogOptions>({
      options,
      unstyled: (messages) => {
        console.log(...messages);
      },
      styled: (template) => {
        const { labels, text, context } = template;

        const labelMessages = this._buildTitleMessages({ labels });
        const contextMessages = context
          ? this._buildContextMessages(context)
          : [];

        const messages = this._formatMessages(
          ...labelMessages,
          text,
          __PARAGRAPH_SYMBOL__,
          ...contextMessages,
        );

        console.log(...messages);
      },
    });
  }

  info(options: IConsoleInfoOptions | unknown[]) {
    const kind: LogKindDetails = {
      value: 'info',
      styles: {
        client: {
          backgroundColor: 'rgba(68, 123, 242, 0.4)',
          borderColor: 'rgba(68, 120, 242, 0.7)',
        },
        terminal: {
          textColor: TerminalTextColor.BlueBold,
        },
      },
    };

    LogMethodOptions.switch<IConsoleInfoOptions>({
      options,
      unstyled: (messages) => {
        const kindMessages = this._buildTitleMessages({ kind });

        console.info(...kindMessages, ...messages);
      },
      styled: (template) => {
        const { labels, text, context } = template;

        const titleMessages = this._buildTitleMessages({ kind, labels });

        const contextMessages = context
          ? this._buildContextMessages(context)
          : [];

        const messages = this._formatMessages(
          ...titleMessages,
          text,
          __PARAGRAPH_SYMBOL__,
          ...contextMessages,
        );

        console.info(...messages);
      },
    });
  }

  warn(options: IConsoleWarnOptions | unknown[]) {
    const kind: LogKindDetails = {
      value: 'warning',
      styles: {
        client: {
          backgroundColor: 'rgba(222, 184, 16, 0.5)',
          borderColor: 'rgb(222, 184, 16)',
        },
        terminal: {
          textColor: TerminalTextColor.YellowBold,
        },
      },
    };

    LogMethodOptions.switch<IConsoleWarnOptions>({
      options,
      unstyled: (messages) => {
        const kindMessages = this._buildTitleMessages({ kind });

        console.warn(...kindMessages, ...messages);
      },
      styled: (template) => {
        const { labels, text, context } = template;

        const titleMessages = this._buildTitleMessages({ kind, labels });

        const contextMessages = context
          ? this._buildContextMessages(context)
          : [];

        const messages = this._formatMessages(
          ...titleMessages,
          text,
          __PARAGRAPH_SYMBOL__,
          ...contextMessages,
        );

        console.warn(...messages);
      },
    });
  }

  error(options: IConsoleErrorOptions | unknown[]) {
    const kind: LogKindDetails = {
      value: 'error',
      styles: {
        client: {
          backgroundColor: 'rgba(242, 68, 68, 0.4)',
          borderColor: 'rgba(242, 68, 68, 0.7)',
        },
        terminal: {
          textColor: TerminalTextColor.RedBold,
        },
      },
    };

    LogMethodOptions.switch<IConsoleErrorOptions>({
      options,
      unstyled: (messages) => {
        const kindMessages = this._buildTitleMessages({ kind });

        console.error(...kindMessages, ...messages);
      },
      styled: (template) => {
        const { labels, text, error, context } = template;

        const titleMessages = this._buildTitleMessages({ kind, labels });

        const errorMessages = this._buildErrorMessages(error);
        const contextMessages = context
          ? this._buildContextMessages(context)
          : [];

        const messages = this._formatMessages(
          ...titleMessages,
          text,
          __PARAGRAPH_SYMBOL__,
          ...errorMessages,
          __PARAGRAPH_SYMBOL__,
          ...contextMessages,
        );

        console.error(...messages);
      },
    });
  }

  success(options: IConsoleSuccessOptions | unknown[]) {
    const kind: LogKindDetails = {
      value: 'success',
      styles: {
        client: {
          backgroundColor: 'rgba(68, 242, 71, 0.4)',
          borderColor: 'rgba(68, 242, 94, 0.7)',
        },
        terminal: {
          textColor: TerminalTextColor.GreenBold,
        },
      },
    };

    LogMethodOptions.switch<IConsoleSuccessOptions>({
      options,
      unstyled: (messages) => {
        const kindMessages = this._buildTitleMessages({ kind });

        console.log(...kindMessages, ...messages);
      },
      styled: (template) => {
        const { labels, text, context } = template;

        const titleMessages = this._buildTitleMessages({ kind, labels });

        const contextMessages = context
          ? this._buildContextMessages(context)
          : [];

        const messages = this._formatMessages(
          ...titleMessages,
          text,
          __PARAGRAPH_SYMBOL__,
          ...contextMessages,
        );

        console.log(...messages);
      },
    });
  }

  private _buildTitleMessages(data: TitleMessagesData): string[] {
    return IS_WINDOW_DEFINED
      ? this._buildClientTitleMessages(data)
      : this._buildTerminalTitleMessages(data);
  }

  private _buildTerminalTitleMessages(data: TitleMessagesData): string[] {
    const { kind, labels } = data;

    const stringifiedLabels = labels?.reduce(
      (acc, item) => `${acc}[${item.value}]`,
      '',
    );
    const labelsMessage = stringifiedLabels
      ? this._buildColoredTerminalMessage(
          `${stringifiedLabels}:`,
          TerminalTextColor.Gray,
        )
      : null;

    if (kind !== undefined) {
      const kindMessage = this._buildColoredTerminalMessage(
        kind.value,
        kind.styles.terminal.textColor,
      );

      return labelsMessage
        ? [`${kindMessage} ${labelsMessage}`]
        : [`${kindMessage}:`];
    }

    return labelsMessage ? [labelsMessage] : [];
  }

  private _buildClientTitleMessages(data: TitleMessagesData): string[] {
    const { kind, labels } = data;

    const stringifiedLabels = labels?.reduce(
      (acc, item) => `${acc}[${item.value}]`,
      '',
    );
    const labelStyles = 'color: rgb(161, 161, 161)';

    if (kind !== undefined) {
      const kindStyles = [
        `background-color: ${kind.styles.client.backgroundColor}`,
        `border: 1px solid ${kind.styles.client.borderColor}`,
        'border-radius: 5px',
        'padding: 2px 4px',
      ].join(';');

      return stringifiedLabels !== undefined
        ? [`%c${kind.value}%c ${stringifiedLabels}:`, kindStyles, labelStyles]
        : [`%c${kind.value}:`, kindStyles];
    }

    return [`%c${stringifiedLabels}:`, labelStyles];
  }

  private _buildErrorMessages(error: unknown): unknown[] {
    return ['Error:', IS_WINDOW_DEFINED ? error : Json.stringify(error)];
  }

  private _buildContextMessages(context: Record<string, unknown>): unknown[] {
    return ['Context:', IS_WINDOW_DEFINED ? context : Json.stringify(context)];
  }

  private _buildColoredTerminalMessage(
    message: string,
    color: TerminalTextColor,
  ): string {
    return `${color}${message}${TerminalTextColor.Unset}`;
  }

  private _formatMessages(...messages: unknown[]): unknown[] {
    const filteredMessages: unknown[] = this._filterMessages(messages);
    const formattedMessages: unknown[] = [];

    for (let index = 0; index < filteredMessages.length; index++) {
      const message = filteredMessages[index];

      if (!this._isSpecialSymbol(message)) {
        formattedMessages.push(message);
        continue;
      }

      if (message === __PARAGRAPH_SYMBOL__) {
        const prevMessage = formattedMessages[formattedMessages.length - 1];
        const nextMessage = filteredMessages[index + 1];

        if (nextMessage !== undefined) {
          formattedMessages.push(
            prevMessage ? `\n\n${nextMessage}` : nextMessage,
          );
        }
      }

      index++;
    }

    return IS_WINDOW_DEFINED
      ? formattedMessages
      : this._addMessagePrefixes(formattedMessages);
  }

  private _addMessagePrefixes(messages: unknown[]): unknown[] {
    const joinedMessages = messages.join(' ');

    const numberOfNewLineSymbols = Array.from(
      joinedMessages.matchAll(/(\r?\n)/g),
    ).length;

    if (numberOfNewLineSymbols === 0) {
      return [`◦ ${joinedMessages}`];
    }

    return [
      '╭ ' +
        joinedMessages
          .replace(/(\r?\n)/g, '$1│ ')
          .replace(/(\r?\n)(│)([^\r\n]*)$/g, '$1╰$3'),
    ];
  }

  private _filterMessages(messages: unknown[]): unknown[] {
    const stack: unknown[] = [];

    for (const message of messages) {
      if (
        this._isValidMessage(message) &&
        (!this._isSpecialSymbol(message) || stack[stack.length - 1] !== message)
      ) {
        stack.push(message);
      }
    }

    return stack;
  }

  private _isValidMessage(message: unknown) {
    const isSpecialSymbol = (
      SPECIAL_SYMBOLS satisfies unknown[] as unknown[]
    ).includes(message);

    return isSpecialSymbol || !!message;
  }

  private _isSpecialSymbol(value: unknown): value is symbol {
    return (SPECIAL_SYMBOLS satisfies unknown[] as unknown[]).includes(value);
  }
}
