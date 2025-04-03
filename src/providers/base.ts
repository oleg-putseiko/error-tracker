export type LogLabel = { name: string; value: string };

export interface IContextualOptions {
  labels?: LogLabel[];
  context?: Record<string, unknown>;
}

export interface IDebugOptions extends IContextualOptions {}

export interface ILogOptions extends IContextualOptions {}

export interface IInfoOptions extends IContextualOptions {}

export interface IWarnOptions extends IContextualOptions {}

export interface IErrorOptions extends IContextualOptions {
  error: unknown;
}

export interface ISuccessOptions extends IContextualOptions {}

export interface ILogProvider<TId extends string> {
  readonly id: TId;

  debug?(options: IDebugOptions): void | Promise<void>;
  log(options: ILogOptions): void | Promise<void>;
  info(options: IInfoOptions): void | Promise<void>;
  warn(options: IWarnOptions): void | Promise<void>;
  error(options: IErrorOptions): void | Promise<void>;
  success(options: ISuccessOptions): void | Promise<void>;
}
