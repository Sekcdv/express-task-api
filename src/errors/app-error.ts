import { FieldIssue } from "../types/api-terror.js";
export class AppError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number,
        public readonly code: string,
        public readonly details?: FieldIssue[]
    ) {
        super(message);
        this.name = 'AppError';
    }
}