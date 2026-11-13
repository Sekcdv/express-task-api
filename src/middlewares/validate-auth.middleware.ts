import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app-error.js';
import type { FieldIssue } from '../types/api-terror.js';
import type { LoginInput, RegisterInput } from '../types/auth.js';

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const isEmail = (value: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const invalidInput = (details: FieldIssue[]): AppError =>
    new AppError(
        'La solicitud contiene datos inválidos.',
        422,
        'VALIDATION_ERROR',
        details
    );

export const validateRegister = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const body = isRecord(req.body) ? req.body : {};
    const issues: FieldIssue[] = [];
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string'
        ? body.email.trim().toLowerCase()
        : '';
    const password = typeof body.password === 'string'
        ? body.password
        : '';

    if (!name || name.length > 100) {
        issues.push({
            field: 'name',
            message: 'Debe ser texto no vacío de hasta 100 caracteres.'
        });
    }
    if (!isEmail(email) || email.length > 254) {
        issues.push({
            field: 'email',
            message: 'Debe ser un correo electrónico válido.'
        });
    }
    if (
        password.length < 8
        || Buffer.byteLength(password, 'utf8') > 72
    ) {
        issues.push({
            field: 'password',
            message: 'Debe tener al menos 8 caracteres y no superar 72 bytes.'
        });
    }
    if (issues.length > 0) {
        next(invalidInput(issues));
        return;
    }

    res.locals.registerInput = { name, email, password } satisfies RegisterInput;
    next();
};

export const validateLogin = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const body = isRecord(req.body) ? req.body : {};
    const email = typeof body.email === 'string'
        ? body.email.trim().toLowerCase()
        : '';
    const password = typeof body.password === 'string'
        ? body.password
        : '';
    const issues: FieldIssue[] = [];

    if (!isEmail(email) || email.length > 254) {
        issues.push({
            field: 'email',
            message: 'Debe ser un correo electrónico válido.'
        });
    }
    if (!password || Buffer.byteLength(password, 'utf8') > 72) {
        issues.push({
            field: 'password',
            message: 'Debe tener entre 1 y 72 bytes.'
        });
    }
    if (issues.length > 0) {
        next(invalidInput(issues));
        return;
    }

    res.locals.loginInput = { email, password } satisfies LoginInput;
    next();
};
