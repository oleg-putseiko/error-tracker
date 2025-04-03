export type LogLabel = { name: string; value: string };

export interface IDebugOptions {
  debug?: boolean;
}

export interface IContextualOptions {
  labels?: LogLabel[];
  context?: Record<string, unknown>;
}

export interface ILogOptions extends IDebugOptions, IContextualOptions {}

export interface IInfoOptions extends IDebugOptions, IContextualOptions {}

export interface IWarnOptions extends IDebugOptions, IContextualOptions {}

export interface IErrorOptions extends IDebugOptions, IContextualOptions {
  error: unknown;
}

export interface ISuccessOptions extends IDebugOptions, IContextualOptions {}

export interface ILogProvider<TId extends string> {
  readonly id: TId;

  log(options: ILogOptions): void | Promise<void>;
  info(options: IInfoOptions): void | Promise<void>;
  warn(options: IWarnOptions): void | Promise<void>;
  error(options: IErrorOptions): void | Promise<void>;
  success(options: ISuccessOptions): void | Promise<void>;
}
