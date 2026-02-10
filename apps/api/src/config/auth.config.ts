import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwt: {
    accessToken: {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET || 'access-secret-key',
      exp: process.env.JWT_ACCESS_TOKEN_EXPIRE || '15m',
    },
    refreshToken: {
      secret: process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh-secret-key',
      exp: process.env.JWT_REFRESH_TOKEN_EXPIRE || '7d',
    },
  },
  cookie: {
    refreshToken: {
      name: 'refreshToken',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  },
}));
