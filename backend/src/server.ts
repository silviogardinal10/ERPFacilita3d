import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from './utils/crypto';

import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import productsRoutes from './routes/products';
import settingsRoutes from './routes/settings';

const app = express();
const prisma = new PrismaClient();

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost', 'https://facilita3d.shop', 'https://www.facilita3d.shop', '*'],
    credentials: true
}));

app.use(express.json());

// Rotas
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/products', productsRoutes);
app.use('/settings', settingsRoutes);

// Seed initial Admin se não existir
async function seedAdmin() {
    const adminExists = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (!adminExists) {
        const password = await hashPassword('admin123');
        await prisma.user.create({
            data: {
                email: 'admin@erp3d.com',
                name: 'Administrador',
                password,
                role: 'admin'
            }
        });
        console.log('Admin default criado: admin@erp3d.com / admin123');
    }
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
    await seedAdmin();
    console.log(`Servidor rodando na porta ${PORT}`);
});
