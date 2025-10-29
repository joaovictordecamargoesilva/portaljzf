import { Router } from 'express';
import { authRouter, authMiddleware, apiKeyMiddleware } from '../auth';
import { mainRouter } from './main';
import { usersRouter } from './users';
import { clientsRouter } from './clients';
import { documentsRouter } from './documents';
import { invoicesRouter } from './invoices';
import { tasksRouter } from './tasks';
import { settingsRouter } from './settings';
import { employeesRouter } from './employees';
import { geminiRouter } from './gemini';
import { chatRouter } from './chat';
import { taxGuidesRouter } from './taxguides';


const router = Router();

// Public routes (login/logout)
router.use(authRouter);

// Apply API key middleware first to check for Bearer tokens
router.use(apiKeyMiddleware);

// All subsequent routes are protected by the cookie-based auth middleware if no API key was found
router.use(authMiddleware);

// Protected routes
router.use('/', mainRouter);
router.use('/users', usersRouter);
router.use('/clients', clientsRouter);
router.use('/documents', documentsRouter);
router.use('/invoices', invoicesRouter);
router.use('/tasks', tasksRouter);
router.use('/settings', settingsRouter);
router.use('/employees', employeesRouter);
router.use('/gemini', geminiRouter);
router.use('/chat', chatRouter);
router.use('/tax-guides', taxGuidesRouter);


export default router;
