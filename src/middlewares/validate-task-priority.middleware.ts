import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app-error.js';
import { TASK_PRIORITIES, type TaskPriority } from '../models/task.js';

const isTaskPriority = (value: unknown): value is TaskPriority =>
    typeof value === 'string'
    && TASK_PRIORITIES.some((priority) => priority === value);

export const validateTaskPriority = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const body: unknown = req.body;

    if (typeof body === 'object' && body !== null && 'priority' in body) {
        const priority = (body as Record<string, unknown>).priority;

        if (!isTaskPriority(priority)) {
            next(new AppError(
                'La solicitud contiene datos inválidos.',
                422,
                'VALIDATION_ERROR',
                [{ field: 'priority', message: 'Debe ser low, medium o high.' }]
            ));
            return;
        }
        res.locals.taskPriority = priority;
    }
    next();
};