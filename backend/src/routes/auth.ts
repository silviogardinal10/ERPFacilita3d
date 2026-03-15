import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { comparePassword, hashPassword } from '../utils/crypto';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret_erp3d';

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        if (user.isActive === false) {
             return res.status(403).json({ error: 'Esta conta está temporariamente desativada. Contate o administrador.' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        const { password: _, ...userWithoutPassword } = user;
        res.json({ token, user: userWithoutPassword });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao fazer login' });
    }
});

export default router;
