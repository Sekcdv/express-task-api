import 'dotenv/config';
import dns from 'node:dns';
import type { Server } from 'node:http';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { loadEnvironment } from './config/env.js';

dns.setServers(['8.8.8.8', '1.1.1.1']);

let httpServer: Server | undefined;
let isShuttingDown = false;

const closeHttpServer = (server: Server): Promise<void> => {
    return new Promise((resolve, reject) => {
        server.close((error) => {
            if (error) {
                reject(error);
                return;
            }
            resolve();
        });
        server.closeIdleConnections();
    });
};

const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
    if (isShuttingDown) {
        return;
    }
    isShuttingDown = true;
    console.log(`Señal ${signal} recibida. Cerrando la API...`);

    try {
        if (httpServer) {
            await closeHttpServer(httpServer);
            console.log('Servidor HTTP cerrado.');
        }
        await disconnectDatabase();
    } catch {
        console.error('No fue posible completar el cierre ordenado.');
        process.exitCode = 1;
    }
};

const startServer = async (): Promise<void> => {
    let env: ReturnType<typeof loadEnvironment>;
    try {
        env = loadEnvironment();
    } catch (error: unknown) {
        const message = error instanceof Error
            ? error.message
            : 'Error de configuración desconocido.';
        console.error(`Configuración de inicio inválida: ${message}`);
        process.exitCode = 1;
        return;
    }

    try {
        await connectDatabase({
            uri: env.mongodbUri,
            dbName: env.mongodbDbName
        });
        const { app } = await import('./app.js');
        httpServer = app.listen(env.port, () => {
            console.log(`API disponible en http://localhost:${env.port}`);
        });

        process.on('SIGINT', () => {
            void shutdown('SIGINT');
        });
        process.on('SIGTERM', () => {
            void shutdown('SIGTERM');
        });
    } catch {
        console.error(
            'No fue posible iniciar la API. Revise MongoDB y la configuración.'
        );
        process.exitCode = 1;
    }
};

void startServer();