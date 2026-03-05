import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Listar todos os produtos
router.get('/', authenticate, async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
});

// Criar produto
router.post('/', authenticate, async (req, res) => {
    try {
        const product = await prisma.product.create({
            data: req.body
        });
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar produto' });
    }
});

// Atualizar produto
router.put('/:id', authenticate, async (req, res) => {
    try {
        const product = await prisma.product.update({
            where: { id: req.params.id as string },
            data: req.body
        });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
});

// Deletar produto
router.delete('/:id', authenticate, async (req, res) => {
    try {
        await prisma.product.delete({
            where: { id: req.params.id as string }
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar produto' });
    }
});

export default router;
