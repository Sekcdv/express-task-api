import type { Request, Response } from 'express';
import { loadEnvironment } from '../config/env.js';
import { checkDatabaseHealth } from '../services/database.service.js';
export const getHealth = (_req: Request, res: Response): void => {
    res.status(200).json({
        data: {
            status: 'up',
            version: loadEnvironment.APP_VERSION,
            environment: loadEnvironment.NODE_ENV
        }
    });
};
export const getDatabaseHealth = async (_req: Request, res: Response): Promise<void> => {
    const data = await checkDatabaseHealth();
    res.status(data.status === 'up' ? 200 : 503).json({ data });
};