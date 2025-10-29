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

    // Run the check every 8 hours (3 times a day)
    const EIGHT_HOURS_IN_MS = 8 * 60 * 60 * 1000;
    setInterval(runScheduledChecks, EIGHT_HOURS_IN_MS);
    // --- End of Scheduled Job ---


    // Middleware to attach Prisma client to each request
    const prismaMiddleware = (req: Request, res: Response, next: NextFunction) => {
        req.prisma = prisma;
        next();
    };

    // Core Middlewares
    app.set('trust proxy', 1); // Trust the first proxy
    app.use(cors({ origin: true, credentials: true }));
    app.use(express.json({ limit: '20mb' }));
    app.use(express.urlencoded({ extended: true, limit: '20mb' }));
    app.use(cookieParser());

    app.use(prismaMiddleware);

    // API Routes
    app.use('/api', apiRouter);

    // Serve Frontend
    if (process.env.NODE_ENV === 'production') {
        const frontendDist = path.resolve(__dirname, '..');
        app.use(express.static(frontendDist));

        const frontendHandler = (req: Request, res: Response, next: NextFunction) => {
            if (req.path.startsWith('/api/')) {
                return next();
            }
            res.sendFile(path.resolve(frontendDist, 'index.html'));
        };
        
        app.get('*', frontendHandler);
    } else {
        // Use Vite as middleware in development
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
