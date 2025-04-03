import { ILogContext } from './base';

type VercelEnvironment = 'production' | 'preview' | 'development';

interface IVercelLogContextProps {
  env: VercelEnvironment | null;
  targetEnv: VercelEnvironment | null;
  url: string | null;
}

export class VercelLogContext implements ILogContext {
  getProps(): IVercelLogContextProps {
    return {
      env: (process.env.NEXT_PUBLIC_VERCEL_ENV ||
        null) as VercelEnvironment | null,
      targetEnv: (process.env.NEXT_PUBLIC_VERCEL_TARGET_ENV ||
        null) as VercelEnvironment | null,
      url: process.env.NEXT_PUBLIC_VERCEL_URL || null,
    };
  }
}
