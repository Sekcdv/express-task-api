import type { Server } from 'node:http';
import { app } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
let server: Server | undefined;
const start = async (): Promise<void> => {
    try {
        await connectDatabase({
            uri: env.MONGODB_URI,
            dbName: env.MONGODB_DB_NAME
        }); server = app.listen(env.PORT, () => {
            console.log(`API disponible en http://localhost:${env.PORT}`);
        });
    } catch (error) {
        console.error('No fue posible iniciar la API : ', error);
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