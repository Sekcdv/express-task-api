import cors, { type CorsOptions } from 'cors';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import { loadEnvironment } from '../config/env.js';
import { AppError } from '../errors/app-error.js';
const config = loadEnvironment();
const corsOptions: CorsOptions = {
    origin(origin, callback) {
        if (!origin || origin === config.corsOrigin) {
            callback(null, true);
            return;
        }
        callback(null, false);
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Request-Id', 'RateLimit', 'RateLimit-Policy'],
    maxAge: 600
};
export const securityHeaders = helmet();
export const documentationSecurityHeaders = helmet({
    contentSecurityPolicy: false
});
export const corsPolicy = cors(corsOptions);
export const authRateLimiter = rateLimit({
    windowMs: config.authRateLimitWindowMs,
    limit: config.authRateLimitMax,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler(_req, _res, next) {
        next(new AppError(
            'Demasiados intentos de autenticación. Intenta más tarde.',
            429,
            'AUTH_RATE_LIMIT_EXCEEDED'
        ));
    }
});