type AnyObject = Record<string | number | symbol, unknown>;

export type LogLabel = { name: string; value: string };

export type BaseTemplateOptions = {
  labels?: LogLabel[];
  context?: Record<string, unknown>;
};

export interface IUnstyledLogOptions {
  messages?: unknown[];
}

export interface IStyledLogOptions<TTemplate extends AnyObject = AnyObject> {
  template?: TTemplate & BaseTemplateOptions;
}

export interface IBaseOptions<TTemplate extends AnyObject = AnyObject>
  extends IUnstyledLogOptions,
    IStyledLogOptions<TTemplate> {}

export interface IDebugOptions<TTemplate extends AnyObject = AnyObject>
  extends IBaseOptions<TTemplate> {}

export interface ILogOptions<TTemplate extends AnyObject = AnyObject>
  extends IBaseOptions<TTemplate> {}

export interface IInfoOptions<TTemplate extends AnyObject = AnyObject>
  extends IBaseOptions<TTemplate> {}

export interface IWarnOptions<TTemplate extends AnyObject = AnyObject>
  extends IBaseOptions<TTemplate> {}

export interface IErrorOptions<TTemplate extends AnyObject = AnyObject>
  extends IBaseOptions<TTemplate & { error: unknown }> {}

export interface ISuccessOptions<TTemplate extends AnyObject = AnyObject>
  extends IBaseOptions<TTemplate> {}

export interface ILogFunction<TOptions extends IBaseOptions> {
  (options: TOptions): void | Promise<void>;
}
export interface ILogProvider {
  debug?: ILogFunction<IDebugOptions>;
  log: ILogFunction<ILogOptions>;
  info: ILogFunction<IInfoOptions>;
  warn: ILogFunction<IWarnOptions>;
  error: ILogFunction<IErrorOptions>;
  success: ILogFunction<ISuccessOptions>;
}
