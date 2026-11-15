# ==========================================
# Estágio 1: Build da aplicação Angular
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copia os manifestos de dependências para cache inteligente
COPY package*.json ./

# Instala as dependências de forma limpa e determinística
RUN npm ci

# Copia o código-fonte do projeto
COPY . .

# Compila o projeto Angular em modo de produção
RUN npm run build -- --configuration production

# ==========================================
# Estágio 2: Servidor Web Nginx de produção
# ==========================================
FROM nginx:alpine

# Porta padrão de execução para Cloud Run
ENV PORT=8080
# Garante que o template do Nginx substitua APENAS a variável $PORT (protegendo variáveis internas como $uri)
ENV NGINX_ENVSUBST_FILTER="PORT"

# Copia a configuração do Nginx com suporte a variável $PORT
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copia os artefatos compilados do Angular para o diretório raiz do Nginx
COPY --from=builder /app/dist/gerenciadordeaulas_app/browser /usr/share/nginx/html

# Expõe a porta 8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
