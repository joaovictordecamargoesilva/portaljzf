import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import 'dotenv/config'; 
import apiRouter from './routes/index';
import prisma from './lib/prisma';
// Fix: Import for side-effects to apply global type augmentations from types.ts
import './types';

async function startServer() {
    const app = express();
    const port = parseInt(process.env.PORT || '3001', 10);

    const isProduction = process.env.NODE_ENV === 'production';

    // --- Scheduled Job for Notifications ---
    const runScheduledChecks = async () => {
        console.log(`[Scheduler] Running scheduled checks at ${new Date().toISOString()}`);
        try {
            const prismaForJob = prisma; // Use the existing prisma instance

            // 1. Find pending invoices and notify clients
            const pendingInvoices = await prismaForJob.invoice.findMany({
                where: {
                    OR: [{ status: 'Pendente' }, { status: 'Atrasado' }]
                },
                include: {
                    client: {
                        include: {
                            users: true
                        }
                    }
                }
            });

            for (const invoice of pendingInvoices) {
                for (const user of invoice.client.users) {
                     await prismaForJob.appNotification.create({
                        data: {
                            userId: user.id,
                            message: `Lembrete: A fatura "${invoice.description}" está pendente de pagamento.`,
                            link: '/cobranca'
                        }
                    });
                }
            }
            if (pendingInvoices.length > 0) {
                console.log(`[Scheduler] Sent reminders for ${pendingInvoices.length} pending invoices.`);
            }


            // 2. Find clients with pending tasks and notify them
            const pendingTasks = await prismaForJob.task.findMany({
                where: { status: 'Pendente' }
            });

            const tasksByClient: { [key: number]: number } = {};
            pendingTasks.forEach((task: any) => {
                tasksByClient[task.clientId] = (tasksByClient[task.clientId] || 0) + 1;
            });

            for (const clientIdStr in tasksByClient) {
                const clientId = parseInt(clientIdStr, 10);
                const taskCount = tasksByClient[clientId];

                const clientWithUsers = await prismaForJob.client.findUnique({
                    where: { id: clientId },
                    include: { users: true }
                });

                if (clientWithUsers) {
                    for (const user of clientWithUsers.users) {
                        await prismaForJob.appNotification.create({
                            data: {
                                userId: user.id,
                                message: `Lembrete: Você possui ${taskCount} tarefa(s) pendente(s). Por favor, verifique a seção de tarefas.`,
                                link: '/tarefas'
                            }
                        });
                    }
                }
            }
            if (Object.keys(tasksByClient).length > 0) {
                console.log(`[Scheduler] Sent reminders to ${Object.keys(tasksByClient).length} clients about pending tasks.`);
            }


        } catch (error) {
            console.error("[Scheduler] Error running scheduled checks:", error);
        }
    };

    if (isProduction) {
        const EIGHT_HOURS_IN_MS = 8 * 60 * 60 * 1000;
        setInterval(runScheduledChecks, EIGHT_HOURS_IN_MS);
    }
    // --- End of Scheduled Job ---


    // --- ORDER OF OPERATIONS IS CRITICAL ---

    // 1. Core Middlewares (for all routes)
    app.set('trust proxy', true);
    app.use(cors({ origin: true, credentials: true }));
    app.use(express.json({ limit: '20mb' }));
    app.use(express.urlencoded({ extended: true, limit: '20mb' }));
    app.use(cookieParser());

    // Middleware to attach Prisma client to each request
    const prismaMiddleware = (req: Request, res: Response, next: NextFunction) => {
        req.prisma = prisma;
        next();
    };

    // 2. API Routes (with their specific middleware)
    app.use('/api', prismaMiddleware, apiRouter);
    
    // 3. Frontend Serving (Production vs. Development)
    if (isProduction) {
        const buildPath = path.resolve(__dirname, '..');
        
        // Serve static files from the build directory (CSS, JS, images)
        app.use(express.static(buildPath));
        
        // SPA Fallback: For any request that doesn't match an API route or a static file,
        // send the main index.html file. This MUST be after API routes and static serving.
        app.get('*', (req: Request, res: Response) => {
            res.sendFile(path.resolve(buildPath, 'index.html'));
        });

    } else {
        // In development, we use Vite's dev server as middleware.
        const { createServer: createViteServer } = await import('vite');
        const vite = await createViteServer({
            root: path.resolve(__dirname, '..'), // Explicitly set project root
            server: { middlewareMode: true },
            appType: 'spa',
        });
        app.use(vite.middlewares);
    }

    app.listen(port, '0.0.0.0', () => {
        console.log(`[Server] Servidor está rodando na porta: ${port}`);
    });
}

startServer();
