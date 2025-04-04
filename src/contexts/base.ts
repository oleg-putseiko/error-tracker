export interface ILogContextProps {}

export interface ILogContext {
  getProps(): ILogContextProps | null;
}
