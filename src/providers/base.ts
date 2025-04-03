export type LogLabel = { name: string; value: string };

export interface IDebuggingOptions {
  debug?: boolean;
}

export interface IContextualOptions {
  labels?: LogLabel[];
  context?: Record<string, unknown>;
}

export interface IDebugOptions extends IDebuggingOptions, IContextualOptions {}

export interface ILogOptions extends IDebuggingOptions, IContextualOptions {}

export interface IInfoOptions extends IDebuggingOptions, IContextualOptions {}

export interface IWarnOptions extends IDebuggingOptions, IContextualOptions {}

export interface IErrorOptions extends IDebuggingOptions, IContextualOptions {
  error: unknown;
}

export interface ISuccessOptions
  extends IDebuggingOptions,
    IContextualOptions {}

export interface ILogProvider<TId extends string> {
  readonly id: TId;

  debug?(options: IDebugOptions): void | Promise<void>;
  log(options: ILogOptions): void | Promise<void>;
  info(options: IInfoOptions): void | Promise<void>;
  warn(options: IWarnOptions): void | Promise<void>;
  error(options: IErrorOptions): void | Promise<void>;
  success(options: ISuccessOptions): void | Promise<void>;
}
