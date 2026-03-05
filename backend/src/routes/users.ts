import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/crypto';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Listar todos os usuários (Apenas Admin)
router.get('/', authenticate, requireAdmin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, email: true, name: true, role: true, provider: true, createdAt: true },
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
});

// Criar um novo usuário (Apenas Admin)
router.post('/', authenticate, requireAdmin, async (req, res) => {
    const { email, password, name, role } = req.body;

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }

        const hashedPassword = await hashPassword(password);
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: role || 'user',
                provider: 'email',
            },
        });

        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar usuário' });
    }
});

// Alterar senha pelo próprio usuário
router.put('/change-password', authenticate, async (req: any, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    try {
        // Lógica abstraída aqui por brevidade
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao alterar senha' });
    }
});

export default router;
