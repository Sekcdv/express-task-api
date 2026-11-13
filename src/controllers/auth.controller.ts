import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app-error.js';
import { loginUser, registerUser } from '../services/auth.service.js';

export const postRegister = async (
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const input = res.locals.registerInput;
    if (!input) {
        next(new AppError(
            'No se validaron los datos de registro.',
            500,
            'INTERNAL_ERROR'
        ));
        return;
    }
    const result = await registerUser(input);
    res.status(201).json({ data: result });
};

export const postLogin = async (
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const input = res.locals.loginInput;
    if (!input) {
        next(new AppError(
            'No se validaron los datos de inicio de sesión.',
            500,
            'INTERNAL_ERROR'
        ));
        return;
    }
    const result = await loginUser(input);
    res.status(200).json({ data: result });
};
