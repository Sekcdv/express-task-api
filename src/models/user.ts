import { Schema, model } from 'mongoose';

export const USER_ROLES = ['user', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const isUserRole = (value: string): value is UserRole =>
    USER_ROLES.some((role) => role === value);

export interface UserPersistence {
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<UserPersistence>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: 254
        },
        passwordHash: {
            type: String,
            required: true,
            select: false
        },
        role: {
            type: String,
            enum: USER_ROLES,
            default: 'user',
            required: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export const UserModel = model<UserPersistence>('User', userSchema);
