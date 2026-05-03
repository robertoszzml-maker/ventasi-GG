import { registerAs } from '@nestjs/config';

export default registerAs('authConfig', () => {
  return {
    key: process.env.AUTH_KEY,
    app: process.env.AUTH_APP,
    jwtSecret: process.env.AUTH_JWT_SECRET,
    jwtExpired: process.env.AUTH_JWT_EXPIRED,
    jwtRefreshSecret: process.env.AUTH_JWT_REFRESH_SECRET,
    jwtRefreshSecretExpired: process.env.AUTH_JWT_REFRESH_EXPIRED,
    cookieExpired: process.env.COOKIE_EXPIRED,
    cookieDomain: process.env.COOKIE_DOMAIN,
    cookieSecure: process.env.COOKIE_SECURE,
    cookieSessionTokenName: process.env.COOKIE_SESSION_TOKEN_NAME,
    authSessionOptionName: process.env.AUTH_OPTION_NAME
  };
});
