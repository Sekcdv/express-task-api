import { Router } from 'express';
import {
    getDatabaseHealth,
    getHealth
} from '../controllers/healt.controller.js';

export const healthRouter = Router();

healthRouter.get('/', getHealth);
healthRouter.get('/database', getDatabaseHealth);