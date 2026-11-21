import type { Server } from 'node:http';
import { app } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { loadEnvironment } from './config/env.js';
let server: Server | undefined;
const start = async (): Promise<void> => {
    try {
        await connectDatabase({
            uri: loadEnvironment.MONGODB_URI,
            dbName: loadEnvironment.MONGODB_DB_NAME
        });
        server = app.listen(loadEnvironment.PORT, '0.0.0.0', () => {
            console.log(`API ${loadEnvironment.APP_VERSION} disponible en ${loadEnvironment.PUBLIC_API_URL}`);
        });
    } catch {
        console.error('No fue posible iniciar la API. Revisa la configuración y la conexión.');
        process.exitCode = 1;
    }
};
const shutdown = async (signal: string): Promise<void> => {
    console.log(`Se recibió ${signal}. Cerrando la API.`);
    if (server) {
        await new Promise<void>((resolve, reject) => {
            server?.close((error) => error ? reject(error) : resolve());
        });
    }
    await disconnectDatabase();
};
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, () => {
        void shutdown(signal).catch(() => {
            console.error('No fue posible cerrar la API correctamente.');
            process.exitCode = 1;
        });
    });
}
await start();