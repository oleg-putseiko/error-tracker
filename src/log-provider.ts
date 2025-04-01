export interface IDebugOptions {
  debug?: boolean;
}

export interface IErrorOptions extends IDebugOptions {
  error: unknown;
  context?: Record<string, unknown>;
}

export interface ILogProvider<TId extends string> {
  readonly id: TId;

  error(options: IErrorOptions): void | Promise<void>;
}
