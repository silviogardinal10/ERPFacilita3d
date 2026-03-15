import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Listar todos os suprimentos
router.get('/', authenticate, async (req, res) => {
    try {
        const supplies = await prisma.supply.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json(supplies);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar suprimentos' });
    }
});

// Buscar um suprimento específico
router.get('/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    try {
        const supply = await prisma.supply.findUnique({
            where: { id: id as string },
        });
        
        if (!supply) {
            return res.status(404).json({ error: 'Suprimento não encontrado' });
        }
        
        res.json(supply);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar suprimento' });
    }
});

// Criar um novo suprimento
router.post('/', authenticate, async (req, res) => {
    const { name, type, pricePaid, quantity, unit, color } = req.body;

    try {
        const supply = await prisma.supply.create({
            data: {
                name,
                type,
                pricePaid: parseFloat(pricePaid),
                quantity: parseFloat(quantity),
                unit,
                color,
            },
        });
        res.status(201).json(supply);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar suprimento' });
    }
});

// Atualizar um suprimento
router.put('/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const { name, type, pricePaid, quantity, unit, color } = req.body;

    try {
        const supply = await prisma.supply.update({
            where: { id: id as string },
            data: {
                name,
                type,
                pricePaid: parseFloat(pricePaid),
                quantity: parseFloat(quantity),
                unit,
                color,
            },
        });
        res.json(supply);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar suprimento' });
    }
});

// Deletar um suprimento
router.delete('/:id', authenticate, async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.supply.delete({
            where: { id: id as string },
        });
        res.json({ success: true, message: 'Suprimento deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar suprimento' });
    }
});

export default router;
