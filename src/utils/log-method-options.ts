import { IBaseOptions } from '../providers/base';

type SwitchParams<TOptions extends IBaseOptions> = {
  options: TOptions | unknown[];
  styled: (
    template: Exclude<TOptions['template'], undefined>,
    options: Omit<TOptions, 'messages' | 'template'>,
  ) => void | Promise<void>;
  unstyled: (
    messages: unknown[],
    options?: Omit<TOptions, 'messages' | 'template'>,
  ) => void | Promise<void>;
};

export class LogMethodOptions {
  static async switch<TOptions extends IBaseOptions>(
    params: SwitchParams<TOptions>,
  ) {
    const { options, styled, unstyled } = params;

    if (Array.isArray(options)) {
      await unstyled(options);
      return;
    }

    const { messages, template, ...delegatedOptions } = options;

    if (messages !== undefined) {
      await unstyled(
        messages as Exclude<TOptions['messages'], undefined>,
        delegatedOptions,
      );
      return;
    }

    if (template !== undefined) {
      await styled(
        template as Exclude<TOptions['template'], undefined>,
        delegatedOptions,
      );
      return;
    }

    throw new TypeError(
      'The property "messages" or "template" must be passed to a logging function.',
    );
  }
}
