import 'dotenv/config';

const requireEnvironmentVariable = (name: string): string => {
    const value = process.env[name]?.trim();
    if (!value) {
        throw new Error(`Falta la variable de entorno ${name}.`);
    }
    return value;
};

const readPort = (): number => {
    const port = Number(process.env.PORT ?? 3000);
    if (!Number.isInteger(port) || port < 1 || port > 65_535) {
        throw new Error('PORT debe ser un número entero entre 1 y 65535.');
    }
    return port;
};

const readJwtSecret = (): string => {
    const secret = requireEnvironmentVariable('JWT_SECRET');
    if (Buffer.byteLength(secret, 'utf8') < 32) {
        throw new Error('JWT_SECRET debe contener al menos 32 bytes.');
    }
    return secret;
};

const readJwtExpiration = (): string => {
    const expiration = process.env.JWT_EXPIRES_IN?.trim() || '1h';
    if (!/^\d+[smhd]$/.test(expiration)) {
        throw new Error(
            'JWT_EXPIRES_IN debe usar un formato como 15m, 1h o 7d.'
        );
    }
    return expiration;
};

const readPositiveInteger = (name: string, fallback: string): number => {
    const value = Number(process.env[name] ?? fallback);
    if (!Number.isInteger(value) || value < 1) {
        throw new Error(`${name} debe ser un número entero mayor que cero.`);
    }
    return value;
};

const readCorsOrigin = (): string => {
    const origin = requireEnvironmentVariable('CORS_ORIGIN');
    let parsedOrigin: URL;
    try {
        parsedOrigin = new URL(origin);
    } catch {
        throw new Error('CORS_ORIGIN debe ser un origen HTTP o HTTPS válido.');
    }
    if (
        !['http:', 'https:'].includes(parsedOrigin.protocol)
        || parsedOrigin.origin !== origin
    ) {
        throw new Error(
            'CORS_ORIGIN debe incluir esquema, host y puerto, sin una ruta.'
        );
    }
    return origin;
};

export interface EnvironmentConfig {
    port: number;
    mongodbUri: string;
    mongodbDbName: string;
    jwtSecret: string;
    jwtExpiresIn: string;
    jwtIssuer: string;
    jwtAudience: string;
    corsOrigin: string;
    authRateLimitWindowMs: number;
    authRateLimitMax: number;
}

export const loadEnvironment = (): EnvironmentConfig => {
    return {
        port: readPort(),
        mongodbUri: requireEnvironmentVariable('MONGODB_URI'),
        mongodbDbName: requireEnvironmentVariable('MONGODB_DB_NAME'),
        jwtSecret: readJwtSecret(),
        jwtExpiresIn: readJwtExpiration(),
        jwtIssuer: process.env.JWT_ISSUER?.trim() || 'task-api-express',
        jwtAudience: process.env.JWT_AUDIENCE?.trim() || 'task-api-client',
        corsOrigin: readCorsOrigin(),
        authRateLimitWindowMs: readPositiveInteger(
            'AUTH_RATE_LIMIT_WINDOW_MS',
            '900000'
        ),
        authRateLimitMax: readPositiveInteger('AUTH_RATE_LIMIT_MAX', '10')
    };
};