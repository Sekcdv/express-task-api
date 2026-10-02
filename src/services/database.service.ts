import mongoose from 'mongoose';
import { AppError } from '../errors/app-error.js';

export interface DatabaseHealth {
    status: 'connected';
}

const databaseUnavailable = (): AppError => {
    return new AppError(
        'La base de datos no está disponible.',
        503,
        'DATABASE_UNAVAILABLE'
    );
};

export const checkDatabaseHealth = async (): Promise<DatabaseHealth> => {
    const database = mongoose.connection.db;
    if (mongoose.connection.readyState !== 1 || !database) {
        throw databaseUnavailable();
    }
    try {
        await database.admin().ping();
        return { status: 'connected' };
    } catch {
        throw databaseUnavailable();
    }
};