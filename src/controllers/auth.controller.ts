import type { Request, Response } from 'express';
import {
    getAuthenticatedUser,
    loginUser,
    registerUser
} from '../services/auth.service.js';
export const postRegister = async (_req: Request, res: Response): Promise<void> => {
    const input = res.locals.registerInput;
    if (!input) {
        throw new Error('La ruta /register requiere el middleware validateRegister.');
    }

    res.status(201).json({ data: await registerUser(input) });
};
export const postLogin = async (_req: Request, res: Response): Promise<void> => {
    const input = res.locals.loginInput;
    if (!input) {
        throw new Error('La ruta /login requiere el middleware validateLogin.');
    }

    res.status(200).json({ data: await loginUser(input) });
};
export const getMe = async (_req: Request, res: Response): Promise<void> => {
    const auth = res.locals.auth;
    if (!auth) {
        throw new Error('La ruta /me requiere el middleware authenticate.');
    }
    res.status(200).json({
        data: { user: await getAuthenticatedUser(auth.userId) }
    });
};