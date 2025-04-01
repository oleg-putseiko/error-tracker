export interface IDebugOptions {
  debug?: boolean;
}

export interface IInfoOptions extends IDebugOptions {
  context?: Record<string, unknown>;
}

export interface IWarnOptions extends IDebugOptions {
  context?: Record<string, unknown>;
}

export interface IErrorOptions extends IDebugOptions {
  error: unknown;
  context?: Record<string, unknown>;
}

export interface ILogProvider<TId extends string> {
  readonly id: TId;

  info(options: IInfoOptions): void | Promise<void>;
  warn(options: IWarnOptions): void | Promise<void>;
  error(options: IErrorOptions): void | Promise<void>;
}
