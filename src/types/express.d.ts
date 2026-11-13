import type { AccessTokenSubject, LoginInput, RegisterInput } from './auth.js';

declare global {
    namespace Express {
        interface Locals {
            auth?: AccessTokenSubject;
            registerInput?: RegisterInput;
            loginInput?: LoginInput;
        }
    }
}

export {};
