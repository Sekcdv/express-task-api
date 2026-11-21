import 'dotenv/config';
const requireValue = (name: string): string => {
    const value = process.env[name]?.trim();
    if (!value) throw new Error(`Falta la variable de entorno ${name}.`);
    return value;
};
const parsePort = (value: string | undefined): number => {
    const port = Number(value ?? '3000');
    if (!Number.isInteger(port) || port < 1 || port > 65_535) {
        throw new Error('PORT debe ser un número entero entre 1 y 65535.');
    }
    return port;
};
const parseJwtSecret = (): string => {
    const secret = requireValue('JWT_SECRET');
    if (Buffer.byteLength(secret, 'utf8') < 32) {
        throw new Error('JWT_SECRET debe contener al menos 32 bytes.');
    }
    return secret;
};
const parseExpiration = (): string => {
    const value = process.env.JWT_EXPIRES_IN?.trim() || '1h';
    if (!/^\d+[smhd]$/.test(value)) {
        throw new Error('JWT_EXPIRES_IN debe usar un formato como 15m, 1h o 7d.');
    }
    return value;
};
const parsePositiveInteger = (name: string, fallback: string): number => {
    const value = Number(process.env[name] ?? fallback);
    if (!Number.isInteger(value) || value < 1) {
        throw new Error(`${name} debe ser un número entero mayor que cero.`);
    }
    return value;
};
const parseNonNegativeInteger = (name: string, fallback: string): number => {
    const value = Number(process.env[name] ?? fallback);
    if (!Number.isInteger(value) || value < 0) {
        throw new Error(`${name} debe ser un número entero mayor o igual que cero.`);
    }
    return value;
};
const parseEnvironment = (): 'development' | 'test' | 'production' => {
    const value = process.env.NODE_ENV?.trim() || 'development';
    if (value !== 'development' && value !== 'test' && value !== 'production') {
        throw new Error('NODE_ENV debe ser development, test o production.');
    }
    return value;
};
const parseHttpUrl = (name: string): string => {
    const value = requireValue(name).replace(/\/$/, '');
    let url: URL;
    try {
        url = new URL(value);
    } catch {
        throw new Error(`${name} debe ser una URL absoluta válida.`);
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error(`${name} debe utilizar http o https.`);
    }
    return value;
};
export const loadEnvironment = Object.freeze({
    NODE_ENV: parseEnvironment(),
    APP_VERSION: process.env.APP_VERSION?.trim() || '1.0.0',
    PORT: parsePort(process.env.PORT),
    PUBLIC_API_URL: parseHttpUrl('PUBLIC_API_URL'),
    TRUST_PROXY_HOPS: parseNonNegativeInteger('TRUST_PROXY_HOPS', '0'),
    MONGODB_URI: requireValue('MONGODB_URI'),
    MONGODB_DB_NAME: requireValue('MONGODB_DB_NAME'),
    JWT_SECRET: parseJwtSecret(),
    JWT_EXPIRES_IN: parseExpiration(),
    JWT_ISSUER: process.env.JWT_ISSUER?.trim() || 'task-api-express',
    JWT_AUDIENCE: process.env.JWT_AUDIENCE?.trim() || 'task-api-client',
    CORS_ORIGIN: parseHttpUrl('CORS_ORIGIN'),
    AUTH_RATE_LIMIT_WINDOW_MS: parsePositiveInteger(
        'AUTH_RATE_LIMIT_WINDOW_MS',
        '900000'
    ),
    AUTH_RATE_LIMIT_MAX: parsePositiveInteger('AUTH_RATE_LIMIT_MAX', '10')
});