import { tasks } from '../data/task.js';
import { AppError } from '../errors/app-error.js';
import type { Task } from '../models/task.js';
export const listTasks = (): readonly Task[] => tasks;
export const findTaskById = (id: number): Task => {
    const task = tasks.find((item) => item.id === id);
    if (!task) {
        throw new AppError(`No existe una tarea con el id ${id}.`, 404);
    }
    return task;
};
export const createTask = (title: unknown): Task => {
    if (typeof title !== 'string' || !title.trim()) {
        throw new AppError('El campo title es obligatorio.', 400);
    }
    const task: Task = {
        id: Math.max(0, ...tasks.map((item) => item.id)) + 1,
        title: title.trim(),
        status: 'pending',
        createdAt: new Date()
    };
    tasks.push(task);
    return task;
};
export const completeTask = (id: number): Task => {
    const task = findTaskById(id);
    task.status = 'completed';
    return task;
};
export const deleteTask = (id: number): void => {
    const index = tasks.findIndex((item) => item.id === id);
    if (index === -1) {
        throw new AppError(`No existe una tarea con el id ${id}.`, 404);
    }
    tasks.splice(index, 1);
};