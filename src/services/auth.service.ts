import { compare, hash } from 'bcryptjs';
import { AppError } from '../errors/app-error.js';
import type { UserRole } from '../models/user.js';
import {
    createUserDocument,
    findUserDocumentByEmail
} from '../repositories/user.repository.js';
import type { LoginInput, RegisterInput } from '../types/auth.js';
import { signAccessToken } from './token.service.js';

export interface PublicUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}

export interface LoginResult {
    user: PublicUser;
    role: UserRole;
    tokenType: 'Bearer';
    accessToken: string;
}

const toPublicUser = (user: {
    _id: { toString(): string };
    name: string;
    email: string;
    role: UserRole;
}): PublicUser => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role
});

export const registerUser = async (
    input: RegisterInput
): Promise<PublicUser> => {
    const passwordHash = await hash(input.password, 12);
    const user = await createUserDocument({
        name: input.name,
        email: input.email,
        passwordHash,
        role: 'user'
    });
    return toPublicUser(user);
};

export const loginUser = async (
    input: LoginInput
): Promise<LoginResult> => {
    const user = await findUserDocumentByEmail(input.email, true);
    if (!user || !(await compare(input.password, user.passwordHash))) {
        throw new AppError(
            'El correo o la contraseña no son válidos.',
            401,
            'INVALID_CREDENTIALS'
        );
    }

    const accessToken = await signAccessToken({
        userId: user._id.toString(),
        role: user.role
    });
    return {
        user: toPublicUser(user),
        role: user.role,
        tokenType: 'Bearer',
        accessToken
    };
};
