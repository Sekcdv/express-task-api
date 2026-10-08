import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app-error.js';

export const validateTaskTitle = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const title: unknown = req.body?.title;
    if (typeof title !== 'string' || !title.trim()) {
        next(new AppError(
            'La solicitud contiene datos inválidos.',
            422,
            'VALIDATION_ERROR',
            [{ field: 'title', message: 'Debe ser texto no vacío.' }]
        ));
        return;
    }
    if (title.trim().length > 120) {
        next(new AppError(
            'La solicitud contiene datos inválidos.',
            422,
            'VALIDATION_ERROR',
            [{ field: 'title', message: 'No debe superar 120 caracteres.' }]
        ));
        return;
    }

    const description: unknown = req.body?.description;
    if (description !== undefined) {
        if (typeof description !== 'string') {
            next(new AppError(
                'La solicitud contiene datos inválidos.',
                422,
                'VALIDATION_ERROR',
                [{ field: 'description', message: 'Debe ser texto.' }]
            ));
            return;
        }
        if (description.trim().length > 300) {
            next(new AppError(
                'La solicitud contiene datos inválidos.',
                422,
                'VALIDATION_ERROR',
                [{ field: 'description', message: 'No debe superar 300 caracteres.' }]
            ));
            return;
        }
        const trimmedDescription = description.trim();
        res.locals.taskDescription = trimmedDescription || undefined;
    }

    res.locals.taskTitle = title.trim();
    next();
};