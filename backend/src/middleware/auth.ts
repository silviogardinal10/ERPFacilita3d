import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret_erp3d';

export interface AuthRequest extends Request {
    user?: { id: string; email: string; role: string };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado' });
    }
    next();
};
