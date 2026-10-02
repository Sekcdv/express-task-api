import mongoose from 'mongoose';

export interface DatabaseConfig {
    uri: string;
    dbName: string;
}

export const connectDatabase = async (
    config: DatabaseConfig
): Promise<void> => {
    await mongoose.connect(config.uri, {
        dbName: config.dbName,
        serverSelectionTimeoutMS: 5000
    });
    console.log('Conexión con MongoDB establecida.');
};

export const disconnectDatabase = async (): Promise<void> => {
    await mongoose.disconnect();
    console.log('Conexión con MongoDB cerrada.');
};