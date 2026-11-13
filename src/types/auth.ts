import type { UserRole } from '../models/user.js';

export interface AccessTokenSubject {
    userId: string;
    role: UserRole;
}

export interface RegisterInput {
    name: string;
    email: string;
    password: string;
}

export interface LoginInput {
    email: string;
    password: string;
}
