import mongoose from 'mongoose';

export interface DatabaseHealth {
    status: 'up' | 'down';
}

export const checkDatabaseHealth = async (): Promise<DatabaseHealth> => {
    const database = mongoose.connection.db;
    if (mongoose.connection.readyState !== 1 || !database) {
        return { status: 'down' };
    }
    try {
        await database.admin().ping();
        return { status: 'up' };
    } catch {
        return { status: 'down' };
    }
};