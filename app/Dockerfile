# ESTAPA 1: Construção (Build)
FROM node:20-alpine as build

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos necessários para instalar as dependências
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante dos arquivos do frontend
COPY . .

# Variável de ambiente repassada na hora do build via docker-compose
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Gera os arquivos estáticos para produção
RUN npm run build

# ESTAPA 2: Servidor Web (Nginx)
FROM nginx:alpine

# Copia o resultado do build da etapa 1 para a pasta pública do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Precisamos copiar uma configuração de Nginx que suporte react-router (Single Page Application)
# Faremos isso via volume no docker-compose ou definindo um config default personalizado
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta 80
EXPOSE 80

# Inicia o Nginx e mantém rodando em primeiro plano
CMD ["nginx", "-g", "daemon off;"]
