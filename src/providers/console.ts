import {
  IDebugOptions,
  IInfoOptions,
  ILogOptions,
  ISuccessOptions,
  IWarnOptions,
  type IErrorOptions,
  type ILogProvider,
} from '../log-provider';

enum TerminalTextColor {
  Unset = '\x1b[0m',
  RedBold = '\x1b[1;31m',
  GreenBold = '\x1b[1;32m',
  YellowBold = '\x1b[1;33m',
  BlueBold = '\x1b[1;34m',
  Gray = '\x1b[90m',
}

type ClientLabelStyles = {
  backgroundColor: string;
  borderColor: string;
};

type ServerLabelStyles = {
  textColor: TerminalTextColor;
};

type LabelStyles = {
  client: ClientLabelStyles;
  server: ServerLabelStyles;
};

type LabelDetails = {
  value: string;
  styles: LabelStyles;
};

type TitleMessagesData = {
  label?: LabelDetails;
};

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

type ConsoleLogProviderConfig = IDebugOptions;

const __PARAGRAPH_SYMBOL__: unique symbol = Symbol();

const SPECIAL_SYMBOLS = [__PARAGRAPH_SYMBOL__];

// TODO: amend text displaying
export class ConsoleLogProvider implements ILogProvider<'console'> {
  readonly id = 'console';

  private readonly _isDebugEnabled: boolean;

  constructor(config?: ConsoleLogProviderConfig) {
    this._isDebugEnabled = config?.debug ?? false;
  }

  async log(options: IConsoleLogOptions) {
    const { text, context } = options;

    const titleMessages = this._buildTitleMessages({});
    const contextMessages = context ? this._buildContextMessages(context) : [];

    const messages = this._messages(
      ...titleMessages,
      text,
      __PARAGRAPH_SYMBOL__,
      ...contextMessages,
    );

    console.log(...messages);
  }

  async info(options: IConsoleInfoOptions) {
    const { text, context } = options;

    const titleMessages = this._buildTitleMessages({
      label: {
        value: 'info',
        styles: {
          client: {
            backgroundColor: 'rgba(68, 123, 242, 0.4)',
            borderColor: 'rgba(68, 120, 242, 0.7)',
          },
          server: {
            textColor: TerminalTextColor.BlueBold,
          },
        },
      },
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

  async warn(options: IConsoleWarnOptions) {
    const { text, context } = options;

    const titleMessages = this._buildTitleMessages({
      label: {
        value: 'warning',
        styles: {
          client: {
            backgroundColor: 'rgba(222, 184, 16, 0.5)',
            borderColor: 'rgb(222, 184, 16)',
          },
          server: {
            textColor: TerminalTextColor.YellowBold,
          },
        },
      },
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

  async error(options: IConsoleErrorOptions) {
    const { text, error, context } = options;

    const titleMessages = this._buildTitleMessages({
      label: {
        value: 'error',
        styles: {
          client: {
            backgroundColor: 'rgba(242, 68, 68, 0.4)',
            borderColor: 'rgba(242, 68, 68, 0.7)',
          },
          server: {
            textColor: TerminalTextColor.RedBold,
          },
        },
      },
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

  async success(options: IConsoleSuccessOptions) {
    const { text, context } = options;

    const titleMessages = this._buildTitleMessages({
      label: {
        value: 'success',
        styles: {
          client: {
            backgroundColor: 'rgba(68, 242, 71, 0.4)',
            borderColor: 'rgba(68, 242, 94, 0.7)',
          },
          server: {
            textColor: TerminalTextColor.GreenBold,
          },
        },
      },
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
    const { label } = data;

    const metadata = this._getMetadata();
    const metadataMessage = this._buildColoredTerminalMessage(
      `[${metadata.environment}][${metadata.side}]:`,
      TerminalTextColor.Gray,
    );

    if (label !== undefined) {
      const labelMessage = this._buildColoredTerminalMessage(
        label.value,
        label.styles.server.textColor,
      );

      return [`${labelMessage} ${metadataMessage}`];
    }

    return [metadataMessage];
  }

  private _buildClientTitleMessages(data: TitleMessagesData): string[] {
    const { label } = data;

    const metadata = this._getMetadata();
    const metadataStyles = `color: rgb(161, 161, 161)`;

    if (label !== undefined) {
      const labelStyles = [
        `background-color: ${label.styles.client.backgroundColor}`,
        `border: 1px solid ${label.styles.client.borderColor}`,
        'border-radius: 5px',
        'padding: 2px 4px',
      ].join(';');

      return [
        `%c${label.value} %c[${metadata.environment}][${metadata.side}]:`,
        labelStyles,
        metadataStyles,
      ];
    }

    return [`%c[${metadata.environment}][${metadata.side}]:`, metadataStyles];
  }

  private _getMetadata() {
    const environment = process.env.NODE_ENV || 'development';
    const side = typeof window === 'undefined' ? 'server' : 'client';

    return { environment, side };
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
