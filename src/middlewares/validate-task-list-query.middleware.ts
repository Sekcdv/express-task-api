import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app-error.js';
import {
    TASK_STATUSES,
    type TaskListQuery,
    type TaskSortField,
    type TaskSortOrder,
    type TaskStatus
} from '../models/task.js';
import type { FieldIssue } from '../types/api-terror.js';

const isTaskStatus = (value: string): value is TaskStatus =>
    TASK_STATUSES.some((status) => status === value);

const isTaskSortField = (value: string): value is TaskSortField =>
    value === 'title'
    || value === 'status'
    || value === 'createdAt'
    || value === 'updatedAt';

const isTaskSortOrder = (value: string): value is TaskSortOrder =>
    value === 'asc' || value === 'desc';

export const validateTaskListQuery = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const issues: FieldIssue[] = [];
    const readString = (field: string): string | undefined => {
        const value: unknown = req.query[field];
        if (value === undefined) return undefined;
        if (typeof value !== 'string') {
            issues.push({ field, message: 'Debe aparecer una sola vez.' });
            return undefined;
        }
        return value;
    };

    const parsePositiveInteger = (
        field: string,
        value: string | undefined,
        fallback: number
    ): number => {
        if (value === undefined) return fallback;
        if (!/^\d+$/.test(value)) {
            issues.push({ field, message: 'Debe ser un número entero positivo.' });
            return fallback;
        }
        const parsed = Number(value);
        if (!Number.isSafeInteger(parsed) || parsed < 1) {
            issues.push({ field, message: 'Debe ser un número entero positivo.' });
            return fallback;
        }
        return parsed;
    };

    const page = parsePositiveInteger('page', readString('page'), 1);
    const limit = parsePositiveInteger('limit', readString('limit'), 5);
    if (limit > 100) {
        issues.push({ field: 'limit', message: 'No debe superar 100.' });
    }
    if (!Number.isSafeInteger((page - 1) * limit)) {
        issues.push({
            field: 'page',
            message: 'La combinación de page y limit es demasiado grande.'
        });
    }

    const rawSearch = readString('search');
    const search = rawSearch?.trim() || undefined;
    if (search && search.length > 120) {
        issues.push({ field: 'search', message: 'No debe superar 120 caracteres.' });
    }

    const rawStatus = readString('status');
    let status: TaskStatus | undefined;
    if (rawStatus !== undefined) {
        if (!isTaskStatus(rawStatus)) {
            issues.push({ field: 'status', message: 'Debe ser pending o completed.' });
        } else {
            status = rawStatus;
        }
    }

    const rawSortBy = readString('sortBy');
    const sortBy: TaskSortField = rawSortBy === undefined
        ? 'updatedAt'
        : isTaskSortField(rawSortBy)
            ? rawSortBy
            : 'updatedAt';
    if (rawSortBy !== undefined && !isTaskSortField(rawSortBy)) {
        issues.push({
            field: 'sortBy',
            message: 'Debe ser title, status, createdAt o updatedAt.'
        });
    }

    const rawOrder = readString('order');
    const order: TaskSortOrder = rawOrder === undefined
        ? 'desc'
        : isTaskSortOrder(rawOrder)
            ? rawOrder
            : 'desc';
    if (rawOrder !== undefined && !isTaskSortOrder(rawOrder)) {
        issues.push({ field: 'order', message: 'Debe ser asc o desc.' });
    }

    if (issues.length > 0) {
        next(new AppError(
            'La solicitud contiene parámetros inválidos.',
            422,
            'VALIDATION_ERROR',
            issues
        ));
        return;
    }

    const query: TaskListQuery = {
        page,
        limit,
        ...(search ? { search } : {}),
        ...(status ? { status } : {}),
        sortBy,
        order
    };
    res.locals.taskListQuery = query;
    next();
};
