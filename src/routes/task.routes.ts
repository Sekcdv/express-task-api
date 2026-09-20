// src/routes/task.routes.ts
import { Router } from 'express';
import {
    getTask,
    getTasks,
    patchTaskComplete,
    patchTaskStatus, // <-- Nuevo
    postTask,
    removeTask
} from '../controllers/task.controller.js';
import { requireJson } from '../middlewares/require-json.middleware.js';
import { validateTaskId } from '../middlewares/validate-task-id.middleware.js';
import { validateCompletion } from '../middlewares/validate-completion.middleware.js'; 
import { validateTaskTitle } from '../middlewares/validate-task-title.middlewares.js';

export const taskRouter = Router();

taskRouter.param('id', validateTaskId); 

taskRouter.get('/', getTasks);
taskRouter.get('/:id', getTask);
taskRouter.post('/', requireJson, validateTaskTitle, postTask);
taskRouter.patch('/:id/complete', patchTaskComplete);


taskRouter.patch('/:id/status', requireJson, validateCompletion, patchTaskStatus);

taskRouter.delete('/:id', removeTask);