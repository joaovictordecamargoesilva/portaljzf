import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const router = Router();
const saltRounds = 10;

const nlToArray = (input: any): string[] => {
    if (typeof input === 'string') return input.split('\n').map(item => item.trim()).filter(Boolean);
    return [];
};

// Update general settings
const updateSettings = async (req: Request, res: Response) => {
    if (req.user?.role !== 'AdminGeral' && !req.user?.permissions?.canManageSettings) {
        return res.status(403).json({ message: 'Acesso negado.' });
    }
    const { pixKey, paymentLink } = req.body;
    const updatedSettings = await req.prisma.settings.upsert({
        where: { id: 1 },
        update: { pixKey, paymentLink },
        create: { id: 1, pixKey, paymentLink },
    });
    res.json(updatedSettings);
};

// Create task template
const createTaskTemplate = async (req: Request, res: Response) => {
    if (req.user?.role !== 'AdminGeral' && !req.user?.permissions?.canManageSettings) {
        return res.status(403).json({ message: 'Acesso negado.' });
    }
    const { name, tasks } = req.body;
    
    const newTemplate = await req.prisma.taskTemplateSet.create({
        data: {
            name,
            taskDescriptions: JSON.stringify(nlToArray(tasks)),
        }
    });
    res.status(201).json({ ...newTemplate, taskDescriptions: nlToArray(tasks) });
};

// Delete task template
const deleteTaskTemplate = async (req: Request, res: Response) => {
    if (req.user?.role !== 'AdminGeral' && !req.user?.permissions?.canManageSettings) {
        return res.status(403).json({ message: 'Acesso negado.' });
    }
    const { id } = req.params;
    
    try {
        await req.prisma.taskTemplateSet.delete({ where: { id } });
        res.status(200).json({ success: true });
    } catch(error) {
        res.status(404).json({ message: 'Modelo não encontrado.' });
    }
};

// --- API Key Management ---

const getApiKeys = async (req: Request, res: Response) => {
    if (req.user?.role !== 'AdminGeral') {
        return res.status(403).json({ message: 'Acesso negado.' });
    }
    const keys = await req.prisma.apiKey.findMany({
        select: { id: true, name: true, createdAt: true }
    });
    res.json(keys.map((k: { id: string; name: string; createdAt: Date }) => ({ ...k, createdAt: k.createdAt.toISOString() })));
};

const createApiKey = async (req: Request, res: Response) => {
    if (req.user?.role !== 'AdminGeral') {
        return res.status(403).json({ message: 'Acesso negado.' });
    }
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'O nome da chave é obrigatório.' });
    }

    const rawKey = `jzf_prod_${crypto.randomBytes(24).toString('hex')}`;
    const keyHash = await bcrypt.hash(rawKey, saltRounds);

    const apiKey = await req.prisma.apiKey.create({
        data: { name, keyHash }
    });
    
    res.status(201).json({
        apiKey: { id: apiKey.id, name: apiKey.name, createdAt: apiKey.createdAt.toISOString() },
        rawKey, // IMPORTANT: Return the raw key only on creation
    });
};

const deleteApiKey = async (req: Request, res: Response) => {
    if (req.user?.role !== 'AdminGeral') {
        return res.status(403).json({ message: 'Acesso negado.' });
    }
    const { id } = req.params;
    try {
        await req.prisma.apiKey.delete({ where: { id } });
        res.status(200).json({ success: true });
    } catch(error) {
        res.status(404).json({ message: 'Chave API não encontrada.' });
    }
};


router.put('/', updateSettings);
router.post('/task-templates', createTaskTemplate);
router.delete('/task-templates/:id', deleteTaskTemplate);
router.get('/api-keys', getApiKeys);
router.post('/api-keys', createApiKey);
router.delete('/api-keys/:id', deleteApiKey);

export { router as settingsRouter };
