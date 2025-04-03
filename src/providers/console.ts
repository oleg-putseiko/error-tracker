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

interface IConsoleDebugOptions extends IDebugOptions {
  text: string;
}

interface IConsoleLogOptions extends ILogOptions {
  text: string;
}

interface IConsoleInfoOptions extends IInfoOptions {
  text: string;
}

interface IConsoleWarnOptions extends IWarnOptions {
  text: string;
}

interface IConsoleErrorOptions extends IErrorOptions {
  text?: string;
}

interface IConsoleSuccessOptions extends ISuccessOptions {
  text: string;
}

const __PARAGRAPH_SYMBOL__: unique symbol = Symbol();

const SPECIAL_SYMBOLS = [__PARAGRAPH_SYMBOL__];

export class ConsoleLogProvider implements ILogProvider<'console'> {
  readonly id = 'console';

  debug(options: IConsoleDebugOptions) {
    const { labels, text, context } = options;

    const titleMessages = this._buildTitleMessages({
      kind: {
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
      },
      labels,
    });

    const contextMessages = context ? this._buildContextMessages(context) : [];

    const messages = this._messages(
      ...titleMessages,
      text,
      __PARAGRAPH_SYMBOL__,
      ...contextMessages,
    );

    console.debug(...messages);
  }

  log(options: IConsoleLogOptions) {
    const { labels, text, context } = options;

    const titleMessages = this._buildTitleMessages({ labels });
    const contextMessages = context ? this._buildContextMessages(context) : [];

    const messages = this._messages(
      ...titleMessages,
      text,
      __PARAGRAPH_SYMBOL__,
      ...contextMessages,
    );

    console.log(...messages);
  }

  info(options: IConsoleInfoOptions) {
    const { labels, text, context } = options;

    const titleMessages = this._buildTitleMessages({
      kind: {
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
      },
      labels,
    });

    const contextMessages = context ? this._buildContextMessages(context) : [];

    const messages = this._messages(
      ...titleMessages,
      text,
      __PARAGRAPH_SYMBOL__,
      ...contextMessages,
    );

    console.info(...messages);
  }

  warn(options: IConsoleWarnOptions) {
    const { labels, text, context } = options;

    const titleMessages = this._buildTitleMessages({
      kind: {
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
      },
      labels,
    });

    const contextMessages = context ? this._buildContextMessages(context) : [];

    const messages = this._messages(
      ...titleMessages,
      text,
      __PARAGRAPH_SYMBOL__,
      ...contextMessages,
    );

    console.warn(...messages);
  }

  error(options: IConsoleErrorOptions) {
    const { labels, text, error, context } = options;

    const titleMessages = this._buildTitleMessages({
      kind: {
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
      },
      labels,
    });

    const errorMessages = this._buildErrorMessages(error);
    const contextMessages = context ? this._buildContextMessages(context) : [];

    const messages = this._messages(
      ...titleMessages,
      text,
      __PARAGRAPH_SYMBOL__,
      ...errorMessages,
      __PARAGRAPH_SYMBOL__,
      ...contextMessages,
    );

    console.error(...messages);
  }

  success(options: IConsoleSuccessOptions) {
    const { labels, text, context } = options;

    const titleMessages = this._buildTitleMessages({
      kind: {
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
      },
      labels,
    });

    const contextMessages = context ? this._buildContextMessages(context) : [];

    const messages = this._messages(
      ...titleMessages,
      text,
      __PARAGRAPH_SYMBOL__,
      ...contextMessages,
    );

    console.log(...messages);
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
    return ['Error:', this._stringify(error)];
  }

  private _buildContextMessages(context: Record<string, unknown>): string[] {
    return ['Context:', this._stringify(context)];
  }

  private _buildColoredTerminalMessage(
    message: string,
    color: TerminalTextColor,
  ): string {
    return `${color}${message}${TerminalTextColor.Unset}`;
  }

  private _messages(...messages: unknown[]): unknown[] {
    const validMessages: unknown[] = messages.filter(this._isValidMessage);
    const formattedMessages: unknown[] = [];

    for (let index = 0; index < validMessages.length; index++) {
      const message = validMessages[index];

      if (!this._isSpecialSymbol(message)) {
        formattedMessages.push(message);
        continue;
      }

      if (message === __PARAGRAPH_SYMBOL__) {
        const prevMessage = formattedMessages[formattedMessages.length - 1];
        const nextMessage = validMessages[index + 1];

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

  private _stringify(value: unknown): string {
    return JSON.stringify(value, Object.getOwnPropertyNames(value), 4);
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
