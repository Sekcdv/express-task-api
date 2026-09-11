import type { NextFunction, Request, Response } from 'express';
import {
    completeTask,
    createTask,
    deleteTask,
    findTaskById,
    listTasks
} from '../services/task.service.js';
import { AppError } from '../errors/app-error.js';
const parseId = (value: string | undefined): number => {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
        throw new AppError('El id debe ser un entero positivo.', 400);
    }
    return id;
};
export const getTasks = (_req: Request, res: Response): void => {
    res.status(200).json({ data: listTasks() });
};
export const getTask = (req: Request, res: Response, next: NextFunction): void => {
    try {
        res.status(200).json({ data: findTaskById(parseId(req.params.id as string)) });
    } catch (error: unknown) {
        next(error);
    }
};
export const postTask = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const task = createTask(req.body.title);
        res.status(201).json({ data: task });
    } catch (error: unknown) {
        next(error);
    }
};
export const patchTaskComplete = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const task = completeTask(parseId(req.params.id as string));
        res.status(200).json({ data: task });
    } catch (error: unknown) {
        next(error);
    }
};
export const removeTask = (req: Request, res: Response, next: NextFunction): void => {
    try {
        deleteTask(parseId(req.params.id as string));
        res.status(204).send();
    } catch (error: unknown) {
        next(error);
    }
};