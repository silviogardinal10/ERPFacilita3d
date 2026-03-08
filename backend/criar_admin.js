const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function criarAdmin() {
  try {
    const hash = await bcrypt.hash('123456', 10);
    const user = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@admin.com',
        password: hash,
        role: 'ADMIN'
      }
    });
    console.log('USUARIO CRIADO COM SUCESSO: admin@admin.com / Senha: 123456');
  } catch (err) {
    if (err.code === 'P2002') {
      console.log('O usuario admin@admin.com ja existe no banco de dados.');
    } else {
      console.error('Erro desconhecido ao criar usuario:', err.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

criarAdmin();
