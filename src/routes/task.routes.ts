import { Router } from 'express';
import {
    getTask,
    getTasks,
    patchTask,
    patchTaskComplete,
    postTask,
    removeTask
} from '../controllers/task.controller.js';
import { authenticate } from '../middlewares/authenticate.middleware.js';
import { requireRole } from '../middlewares/authorize.middleware.js';
import { requireJson } from '../middlewares/require-json.middleware.js';
import { validateTaskId } from '../middlewares/validate-task-id.middleware.js';
import { validateTaskTitle } from '../middlewares/validate-task-title.middlewares.js';
import { validateTaskUpdate } from '../middlewares/validate-task-update.middleware.js';
import { validateTaskPriority } from '../middlewares/validate-task-priority.middleware.js';
import { validateTaskListQuery } from '../middlewares/validate-task-list-query.middleware.js';
export const taskRouter = Router();
taskRouter.use(authenticate);
taskRouter.param('id', validateTaskId);
taskRouter.get('/', validateTaskListQuery, getTasks);
taskRouter.get('/:id', getTask);
taskRouter.patch('/:id', requireJson, validateTaskUpdate, patchTask);
taskRouter.patch('/:id/complete', patchTaskComplete);
taskRouter.delete('/:id', requireRole('admin'), removeTask);
taskRouter.post('/', requireJson, validateTaskTitle, validateTaskPriority, postTask);