import { ILogContext } from './base';

type VercelEnvironment = 'production' | 'preview' | 'development';

interface IVercelLogContextProps {
  env: VercelEnvironment | null;
  targetEnv: VercelEnvironment | null;
  url: string | null;
}

const VERCEL_ENV = (process.env.VERCEL_ENV ||
  process.env.NEXT_PUBLIC_VERCEL_ENV) as VercelEnvironment | undefined;

const VERCEL_TARGET_ENV = (process.env.VERCEL_TARGET_ENV ||
  process.env.NEXT_PUBLIC_VERCEL_TARGET_ENV) as VercelEnvironment | undefined;

const VERCEL_URL = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL;

export class VercelLogContext implements ILogContext {
  private _isAvailable = !!VERCEL_ENV;

  getProps(): IVercelLogContextProps | null {
    if (!this._isAvailable) return null;

    return {
      env: VERCEL_ENV || null,
      targetEnv: VERCEL_TARGET_ENV || null,
      url: VERCEL_URL || null,
    };
  }
}
