import { registerAs } from '@nestjs/config';

export type AppConfig = {
  nodeEnv: string;
  port: number;
  frontendUrl: string;
  corsOrigins: string[];
  cookieDomain: string;
  cookieSecure: boolean;
};

export default registerAs(
  'app',
  (): AppConfig => ({
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 4000),
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
    cookieDomain: process.env.COOKIE_DOMAIN ?? 'localhost',
    cookieSecure: (process.env.COOKIE_SECURE ?? 'false').toLowerCase() === 'true',
  }),
);
