# -------------------------
# 1. Base Image (commun dev + prod)
# -------------------------
FROM node:18-slim AS base
LABEL authors="ejhack"

# Dossier de travail
WORKDIR /app

# Copie des dépendances
COPY package.json package-lock.json ./

# Installation des dépendances
RUN npm ci --only=production && \
    npm cache clean --force

# -------------------------
# 2. Développement
# -------------------------
FROM base AS development

# Installation des dépendances de développement
RUN npm install

# Copie du code source
COPY . .

# Ouvre le port 3000
EXPOSE 3000

# Commande pour démarrer en mode développement
CMD ["npm", "run", "dev"]

# -------------------------
# 3. Production (standalone)
# -------------------------
FROM base AS build

# Installation des dépendances de développement nécessaires pour le build
RUN npm install

# Copie du code source
COPY . .

# Génération du build standalone
RUN npm run build && \
    mkdir -p .next/standalone/.next && \
    cp -r .next/static .next/standalone/.next/ && \
    cp -r public .next/standalone/

# -------------------------
# 4. Image finale de production
# -------------------------
FROM node:18-slim AS production

WORKDIR /app

# Copie du dossier standalone généré
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/standalone/.next/static ./.next/static
COPY --from=build /app/public ./public

# Ouvre le port 3000
EXPOSE 3000

# Lance l'application
ENV NODE_ENV=production

# Lance l'application
CMD ["node", "server.js"]
