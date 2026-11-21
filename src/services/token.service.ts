import { errors, jwtVerify, SignJWT, type JWTPayload } from 'jose';
import { loadEnvironment } from '../config/env.js';
import { AppError } from '../errors/app-error.js';
import { isUserRole } from '../models/user.js';
import type { AccessTokenSubject } from '../types/auth.js';

export const createAccessToken = async (
    subject: AccessTokenSubject
): Promise<string> => {
    const env = loadEnvironment;
    return new SignJWT({ role: subject.role })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(subject.userId)
        .setIssuer(env.JWT_ISSUER)
        .setAudience(env.JWT_AUDIENCE)
        .setIssuedAt()
        .setExpirationTime(env.JWT_EXPIRES_IN)
        .sign(new TextEncoder().encode(env.JWT_SECRET));
};



export const verifyAccessToken = async (
    token: string
): Promise<AccessTokenSubject> => {
    const env = loadEnvironment;
    let payload: JWTPayload;
    try {
        ({ payload } = await jwtVerify(
            token,
            new TextEncoder().encode(env.JWT_SECRET),
            {
                algorithms: ['HS256'],
                issuer: env.JWT_ISSUER,
                audience: env.JWT_AUDIENCE
            }
        ));
    } catch (error: unknown) {
        if (error instanceof errors.JOSEError) {
            throw new AppError(
                'El token de acceso no es válido.',
                401,
                'INVALID_TOKEN'
            );
        }
        throw error;
    }

    if (
        typeof payload.sub !== 'string'
        || !payload.sub
        || typeof payload.role !== 'string'
        || !isUserRole(payload.role)
    ) {
        throw new AppError(
            'El token de acceso no es válido.',
            401,
            'INVALID_TOKEN'
        );
    }

    return { userId: payload.sub, role: payload.role };
};
