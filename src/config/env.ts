const requireEnvironmentVariable = (name: string): string => {
    const value = process.env[name]?.trim();
    if (!value) {
        throw new Error(`Falta la variable de entorno ${name}.`);
    }
    return value;
};

const readPort = (): number => {
    const port = Number(process.env.PORT ?? 3000);
    if (!Number.isInteger(port) || port <= 0) {
        throw new Error('PORT debe ser un entero positivo.');
    }
    return port;
};

export interface EnvironmentConfig {
    port: number;
    mongodbUri: string;
    mongodbDbName: string;
}

export const loadEnvironment = (): EnvironmentConfig => {
    return {
        port: readPort(),
        mongodbUri: requireEnvironmentVariable('MONGODB_URI'),
        mongodbDbName: requireEnvironmentVariable('MONGODB_DB_NAME')
    };
};