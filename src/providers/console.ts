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
} from './base';
import { LogMethodOptions } from '../utils/log-method-options';

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

interface IConsoleDebugOptions extends IDebugOptions<TemplateOptions> {}

interface IConsoleLogOptions extends ILogOptions<TemplateOptions> {}

interface IConsoleInfoOptions extends IInfoOptions<TemplateOptions> {}

interface IConsoleWarnOptions extends IWarnOptions<TemplateOptions> {}

interface IConsoleErrorOptions extends IErrorOptions<TemplateOptions> {}

interface IConsoleSuccessOptions extends ISuccessOptions<TemplateOptions> {}

const __PARAGRAPH_SYMBOL__: unique symbol = Symbol();

const SPECIAL_SYMBOLS = [__PARAGRAPH_SYMBOL__];

export class ConsoleLogProvider implements ILogProvider {
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

        const messages = this._messages(
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

        const messages = this._messages(
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

        const messages = this._messages(
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

        const messages = this._messages(
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

        const messages = this._messages(
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

        const messages = this._messages(
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
    return typeof window === 'undefined'
      ? this._buildTerminalTitleMessages(data)
      : this._buildClientTitleMessages(data);
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
        ? [`%c${kind.value} %c${stringifiedLabels}:`, kindStyles, labelStyles]
        : [`%c${kind.value}:`, kindStyles];
    }

    return [`%c${stringifiedLabels}:`, labelStyles];
  }

  private _buildErrorMessages(error: unknown): string[] {
    return ['Error:', Json.stringify(error)];
  }

  private _buildContextMessages(context: Record<string, unknown>): string[] {
    return ['Context:', Json.stringify(context)];
  }

  private _buildColoredTerminalMessage(
    message: string,
    color: TerminalTextColor,
  ): string {
    return `${color}${message}${TerminalTextColor.Unset}`;
  }

  private _messages(...messages: unknown[]): unknown[] {
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

    return formattedMessages;
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
