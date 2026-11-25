import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { loadEnvironment } from '../config/env.js';
import { AppError } from '../errors/app-error.js';
import { findUserDocumentById } from '../repositories/user.repository.js';

interface TokenPayload {
    sub?: unknown;
    role?: unknown;
    exp?: unknown;
    iat?: unknown;
}

const decodePayload = (token: string): TokenPayload => {
    const parts = token.trim().split('.');
    if (parts.length !== 3 || !parts[1]) {
        throw new Error('El token debe ser un JWT con tres partes separadas por puntos.');
    }
    try {
        return JSON.parse(
            Buffer.from(parts[1], 'base64url').toString('utf8')
        ) as TokenPayload;
    } catch {
        throw new Error('No fue posible decodificar el cuerpo del JWT.');
    }
};

const formatDate = (seconds: unknown): string => {
    if (typeof seconds !== 'number') return 'no disponible';
    return new Date(seconds * 1000).toISOString();
};

const run = async (): Promise<void> => {
    const token = process.argv[2]?.trim();
    if (!token) {
        throw new Error('Uso: pnpm token:inspect <accessToken>');
    }

    // Decodificado localmente: no se envía el token a ningún servicio externo
    // y no se verifica la firma, para poder inspeccionar también tokens vencidos.
    const payload = decodePayload(token);
    const userId = payload.sub;
    if (typeof userId !== 'string' || !userId) {
        throw new Error('El token no contiene un sujeto (claim sub) válido.');
    }

    console.log('Token decodificado localmente (firma no verificada):');
    console.log(`  sub (id de usuario): ${userId}`);
    console.log(`  role del token:      ${String(payload.role ?? 'no disponible')}`);
    console.log(`  emitido:             ${formatDate(payload.iat)}`);
    console.log(`  expira:              ${formatDate(payload.exp)}`);

    const env = loadEnvironment;
    await connectDatabase({
        uri: env.MONGODB_URI,
        dbName: env.MONGODB_DB_NAME
    });
    try {
        const user = await findUserDocumentById(userId);
        if (!user) {
            throw new Error(
                `No hay usuario con _id ${userId} en la base ${env.MONGODB_DB_NAME}.`
            );
        }
        console.log('Usuario localizado en MongoDB Atlas:');
        console.log(`  id:    ${user._id.toString()}`);
        console.log(`  email: ${user.email}`);
        console.log(`  name:  ${user.name}`);
        console.log(`  role actual en Atlas: ${user.role}`);
        console.log(
            user.role === payload.role
                ? '  El rol del token coincide con el de Atlas.'
                : '  El rol del token está desactualizado: inicia sesión de nuevo tras cambiarlo en Atlas.'
        );
    } finally {
        await disconnectDatabase();
    }
};

try {
    await run();
} catch (error: unknown) {
    const message = error instanceof AppError || error instanceof Error
        ? error.message
        : 'Error desconocido.';
    console.error(`No fue posible inspeccionar el token. ${message}`);
    process.exitCode = 1;
}
