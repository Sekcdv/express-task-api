import type { Task } from '../models/task.js';
export const tasks: Task[] = [
    {
        id: 1,
        title: 'Configurar Express',
        status: 'completed',
        createdAt: new Date(),
        completed: false
    },
    {
        id: 2,
        title: 'Probar la API con Postman',
        status: 'pending',
        createdAt: new Date(),
        completed: false
    }
];