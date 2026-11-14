import { loadEnvironment } from '../config/env.js';
import { AppError } from '../errors/app-error.js';
import type { User } from '../models/user.js';
import {
    createUserDocument,
    findUserDocumentById,
    findUserDocumentByEmail,
    type UserDocument
} from '../repositories/user.repository.js';
import type {
    LoginInput,
    LoginResult,
    RegisterInput,
    RegisterResult
} from '../types/auth.js';
import { hashPassword, verifyPassword } from './password.service.js';
import { createAccessToken } from './token.service.js';
const DUMMY_PASSWORD_HASH =
    '$2b$12$ryC/a3t1mI7fqF6j4w3Z.OpHQerUsIQUPQYXvd4WSgCRuikv6IF82';
const toUser = (document: UserDocument): User => ({
    id: document._id.toString(),
    name: document.name, email: document.email,
    role: document.role,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt
});
export const registerUser = async (
    input: RegisterInput
): Promise<RegisterResult> => {
    const email = input.email.trim().toLowerCase();
    const existing = await findUserDocumentByEmail(email);
    if (existing) {
        throw new AppError(
            'Ya existe una cuenta con ese correo electrónico.',
            409,
            'USER_EMAIL_EXISTS'
        );
    }
    const passwordHash = await hashPassword(input.password);
    const document = await createUserDocument({
        name: input.name,
        email,
        passwordHash,
        role: 'user'
    });
    return { user: toUser(document) };
};
export const loginUser = async (input: LoginInput): Promise<LoginResult> => {
    const email = input.email.trim().toLowerCase();
    const document = await findUserDocumentByEmail(email, true);
    const passwordHash = document?.passwordHash ?? DUMMY_PASSWORD_HASH;
    const validPassword = await verifyPassword(input.password, passwordHash);
    if (!document || !validPassword) {
        throw new AppError('El correo o la contraseña son incorrectos.', 401, 'INVALID_CREDENTIALS');
    }
    const user = toUser(document);
    const config = loadEnvironment();
    return {
        user,
        accessToken: await createAccessToken({ userId: user.id, role: user.role }),
        tokenType: 'Bearer',
        expiresIn: config.jwtExpiresIn
    };
};
export const getAuthenticatedUser = async (userId: string): Promise<User> => {
    const document = await findUserDocumentById(userId);
    if (!document) {
        throw new AppError(
            'La cuenta asociada al token ya no está disponible.',
            401,
            'AUTHENTICATED_USER_NOT_FOUND'
        );
    }
    return toUser(document);
};