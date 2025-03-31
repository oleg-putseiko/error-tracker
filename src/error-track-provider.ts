export interface IErrorLoggingOptions {
  debug?: boolean;
}

export interface IErrorCaptureOptions extends IErrorLoggingOptions {
  error: unknown;
  context?: Record<string, unknown>;
}

export interface IErrorTrackProvider<TId extends string> {
  readonly id: TId;

  capture(options: IErrorCaptureOptions): void | Promise<void>;
}
