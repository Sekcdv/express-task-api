import express from 'express';
import { taskRouter } from './routes/task.routes.js';
import { notFound } from './middlewares/not-found.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
export const app = express();
app.use(express.json());
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});
app.use('/api/tasks', taskRouter);
app.use(notFound);
app.use(errorHandler);