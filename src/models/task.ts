import { Schema, model } from 'mongoose';
export const TASK_STATUSES = ['pending', 'completed'] as const;
export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskSortField = 'title' | 'status' | 'createdAt' | 'updatedAt';
export type TaskSortOrder = 'asc' | 'desc';

export interface TaskListQuery {
    page: number;
    limit: number;
    search?: string;
    status?: TaskStatus;
    sortBy: TaskSortField;
    order: TaskSortOrder;
}

export interface TaskPageMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface TaskPersistence {
    title: string;
    status: TaskStatus;
    priority: TaskPriority;   // nuevo
    createdAt: Date;
    updatedAt: Date;
}

export interface Task {
    id: string;
    title: string;
    status: TaskStatus;
    priority: TaskPriority;   // nuevo
    createdAt: Date;
    updatedAt: Date;
}

export interface TaskUpdate {
    title?: string;
    status?: TaskStatus;
    priority?: TaskPriority;  // nuevo
}

export interface TaskListResult {
    data: Task[];
    meta: TaskPageMeta;
}

const taskSchema = new Schema<TaskPersistence>(
    {
        title: {
            type: String,
            required: [true, 'El título es obligatorio.'],
            trim: true,
            maxlength: [120, 'El título no debe superar 120 caracteres.']
        },
        priority: {
            type: String,
            enum: TASK_PRIORITIES,
            default: 'medium'
        },
        status: {
            type: String,
            enum: TASK_STATUSES,
            default: 'pending'
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);
export const TaskModel = model<TaskPersistence>('Task', taskSchema);