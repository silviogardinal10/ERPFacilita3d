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

# Gera o Prisma Client focado para a arquitetura Alpine/Linux atual
RUN npx prisma generate

# Copia o arquivo .env se existir (geralmente ignorado pelo dockerignore, mas bom manter)
# COPY .env ./

# Porta que o backend roda
EXPOSE 3001

# Comando para iniciar o servidor em produção usando ts-node
CMD ["npx", "ts-node", "src/server.ts"]
