import { Router, Request, Response, NextFunction } from 'express';
import { User, UserPermissions, UserRole } from './types';
import bcrypt from 'bcrypt';
import { CookieOptions } from 'express';

const AUTH_COOKIE_NAME = 'jzf_auth_userId';

// Helper to get consistent cookie options
const getCookieOptions = (req: Request): CookieOptions => {
    // A more robust check for production. If the hostname is not 'localhost' or '127.0.0.1',
    // we assume it's a deployed environment that runs over HTTPS and requires a secure cookie for iframes.
    const isProduction = req.hostname !== 'localhost' && !req.hostname.startsWith('127.');
    
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
    };
};


const getValidatedRole = (role: string): UserRole => {
    if (role === 'AdminGeral' || role === 'AdminLimitado' || role === 'Cliente') {
        return role;
    }
    console.error(`Invalid user role "${role}" detected in database. Defaulting to 'Cliente'.`);
    return 'Cliente'; 
};


// Helper to map prisma user to application user type
export const toAppUser = (dbUser: any): User => {
    // Explicitly build the permissions object
    const permissions: UserPermissions = {
        canManageClients: dbUser.canManageClients,
        canManageDocuments: dbUser.canManageDocuments,
        canManageBilling: dbUser.canManageBilling,
        canManageAdmins: dbUser.canManageAdmins,
        canManageSettings: dbUser.canManageSettings,
        canViewReports: dbUser.canViewReports,
        canViewDashboard: dbUser.canViewDashboard,
        canManageTasks: dbUser.canManageTasks,
    };
    
    // Explicitly construct the User object to ensure type compliance
    const appUser: User = {
        id: dbUser.id,
        username: dbUser.username,
        name: dbUser.name,
        email: dbUser.email,
        role: getValidatedRole(dbUser.role) as UserRole,
        activeClientId: dbUser.activeClientId as number | null,
        permissions: dbUser.role === 'AdminGeral' ? {
            canManageClients: true, canManageDocuments: true, canManageBilling: true,
            canManageAdmins: true, canManageSettings: true, canViewReports: true,
            canViewDashboard: true, canManageTasks: true
        } : permissions,
        clientIds: dbUser.clients?.map((c: any) => c.id) || [],
    };

    return appUser;
};


const loginHandler = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    
    // Find user and include their related clients
    const userFromDb = await req.prisma.user.findUnique({
        where: { username },
        include: { clients: true },
    });

    if (!userFromDb) {
        return res.status(401).json({ message: 'Nome de usuário ou senha inválidos.' });
    }

    const passwordMatch = await bcrypt.compare(password, userFromDb.password);

    if (!passwordMatch) {
        return res.status(401).json({ message: 'Nome de usuário ou senha inválidos.' });
    }

    const cookieOpts = getCookieOptions(req);

    res.cookie(AUTH_COOKIE_NAME, userFromDb.id, {
        ...cookieOpts,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    
    res.json(toAppUser(userFromDb));
};

const logoutHandler = (req: Request, res: Response) => {
    res.clearCookie(AUTH_COOKIE_NAME, getCookieOptions(req));
    res.status(200).json({ message: 'Logout realizado com sucesso.' });
};

export const apiKeyMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(); // No API key, proceed to cookie auth
    }

    const providedKey = authHeader.split(' ')[1];
    if (!providedKey) {
        return next();
    }

    try {
        const apiKeys = await req.prisma.apiKey.findMany();
        let validKeyEntry = null;

        for (const keyEntry of apiKeys) {
            const match = await bcrypt.compare(providedKey, keyEntry.keyHash);
            if (match) {
                validKeyEntry = keyEntry;
                break;
            }
        }

        if (validKeyEntry) {
            // Found a valid key. Create a synthetic AdminGeral user.
            req.user = {
                id: 0, // System user ID
                username: 'api_user',
                name: validKeyEntry.name,
                email: '',
                role: 'AdminGeral',
                permissions: {
                    canManageClients: true, canManageDocuments: true, canManageBilling: true,
                    canManageAdmins: true, canManageSettings: true, canViewReports: true,
                    canViewDashboard: true, canManageTasks: true
                },
                clientIds: [], // API has access to all clients, controlled by routes
                activeClientId: null,
            };
        }
        // If key is invalid, we just proceed. The next middleware will fail if no user is set.
        return next();

    } catch (error) {
        console.error("API Key middleware error:", error);
        // Don't send response here, let it fall through
        return next();
    }
};


export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    // If a user was already authenticated by the API key middleware, skip cookie check.
    if (req.user) {
        return next();
    }

    const userId = req.cookies[AUTH_COOKIE_NAME];
    
    if (!userId) {
        return res.status(401).json({ message: 'Não autorizado: Nenhum usuário logado.' });
    }

    try {
        const userFromDb = await req.prisma.user.findUnique({
            where: { id: parseInt(userId, 10) },
            include: { clients: true }
        });
        
        if (!userFromDb) {
            // Clear the invalid cookie
            res.clearCookie(AUTH_COOKIE_NAME, getCookieOptions(req));
            return res.status(401).json({ message: 'Não autorizado: Usuário não encontrado.' });
        }
        
        req.user = toAppUser(userFromDb);
        next();

    } catch (error) {
        console.error("Auth middleware error:", error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

const router = Router();
router.post('/login', loginHandler);
router.post('/logout', logoutHandler);

export { router as authRouter };
