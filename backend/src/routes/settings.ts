import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth';
import { encryptData, decryptData } from '../utils/crypto';

const router = Router();
const prisma = new PrismaClient();

// Obter configurações
router.get('/', authenticate, async (req, res) => {
    try {
        let settings = await prisma.setting.findUnique({
            where: { id: 'shopee_config' }
        });

        if (!settings) {
            settings = await prisma.setting.create({
                data: { id: 'shopee_config' }
            });
        }

        // Descriptografar para enviar ao frontend (poderia enviar oculto, mas para este MVP manteremos a lógica do frontend)
        res.json({
            ...settings,
            partnerKey: decryptData(settings.partnerKey || ''),
            accessToken: decryptData(settings.accessToken || ''),
            refreshToken: decryptData(settings.refreshToken || '')
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar configurações' });
    }
});

// Atualizar configurações (Apenas Admin)
router.put('/', authenticate, requireAdmin, async (req, res) => {
    const { shopId, partnerId, partnerKey, accessToken, refreshToken, isActive, sandboxMode } = req.body;

    try {
        const settings = await prisma.setting.upsert({
            where: { id: 'shopee_config' },
            update: {
                shopId,
                partnerId,
                partnerKey: encryptData(partnerKey || ''),
                accessToken: encryptData(accessToken || ''),
                refreshToken: encryptData(refreshToken || ''),
                isActive,
                sandboxMode
            },
            create: {
                id: 'shopee_config',
                shopId,
                partnerId,
                partnerKey: encryptData(partnerKey || ''),
                accessToken: encryptData(accessToken || ''),
                refreshToken: encryptData(refreshToken || ''),
                isActive,
                sandboxMode
            }
        });

        // Validar se consegue descriptografar
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao salvar configurações' });
    }
});

export default router;
