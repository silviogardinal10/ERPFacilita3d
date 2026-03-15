FROM node:20-slim

# Instala ferramentas necessárias
RUN apt-get update -y && apt-get install -y openssl python3 make g++ sqlite3

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependência
COPY package*.json ./
COPY prisma ./prisma/

# Instala as dependências
RUN npm install

# Copia o resto do código do backend
COPY . .

# Salva o novo schema em uma pasta segura para não ser apagado pelo volume do host
RUN mkdir -p /app/temp_prisma && cp prisma/schema.prisma /app/temp_prisma/schema.prisma

# Gera o Prisma Client focado para a arquitetura Alpine/Linux atual
RUN npx prisma generate

# Porta que o backend roda
EXPOSE 3001

# Comando para garantir o update do DB no volume e iniciar o servidor
CMD ["sh", "-c", "cp /app/temp_prisma/schema.prisma prisma/schema.prisma && npx prisma db push && npx prisma generate && npx ts-node src/server.ts"]
