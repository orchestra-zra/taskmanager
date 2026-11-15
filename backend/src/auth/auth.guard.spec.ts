import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

describe('AuthGuard TEST_MODE bypass', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.ENABLE_TEST_MODE;
    delete process.env.TELEGRAM_BOT_TOKEN;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  const createContext = (authorization: string) => {
    const request = { header: () => authorization };
    const response: any = { locals: {} };
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as unknown as ExecutionContext;
    return { context, response };
  };

  it('rejects TEST_MODE in production even when ENABLE_TEST_MODE is "true"', () => {
    process.env.NODE_ENV = 'production';
    process.env.ENABLE_TEST_MODE = 'true';

    const guard = new AuthGuard();
    const { context, response } = createContext('tma TEST_MODE');

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    expect(response.locals.initData).toBeUndefined();
  });

  it('rejects TEST_MODE when ENABLE_TEST_MODE is not set (default-off)', () => {
    process.env.NODE_ENV = 'development';

    const guard = new AuthGuard();
    const { context, response } = createContext('tma TEST_MODE');

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    expect(response.locals.initData).toBeUndefined();
  });

  it('rejects TEST_MODE when ENABLE_TEST_MODE is set to a value other than "true"', () => {
    process.env.NODE_ENV = 'development';
    process.env.ENABLE_TEST_MODE = '1';

    const guard = new AuthGuard();
    const { context, response } = createContext('tma TEST_MODE');

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    expect(response.locals.initData).toBeUndefined();
  });

  it('accepts TEST_MODE only when ENABLE_TEST_MODE is "true" and NODE_ENV is not production', () => {
    process.env.NODE_ENV = 'test';
    process.env.ENABLE_TEST_MODE = 'true';

    const guard = new AuthGuard();
    const { context, response } = createContext('tma TEST_MODE');

    expect(guard.canActivate(context)).toBe(true);
    expect(response.locals.initData).toBeDefined();
    expect(response.locals.initData.user.id).toBe(1448242182);
  });

  it('still rejects regular requests with invalid init data when TEST_MODE is enabled', () => {
    process.env.NODE_ENV = 'test';
    process.env.ENABLE_TEST_MODE = 'true';

    const guard = new AuthGuard();
    const { context } = createContext('tma hash=abc&auth_date=1');

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });
});
