# -------------------------
# 1. Base Image (commun dev + prod)
# -------------------------
FROM node:slim AS base
LABEL authors="ejhack"

# Dossier de travail
WORKDIR /app

# Copie des dépendances
COPY package.json package-lock.json ./

# Installation des dépendances
RUN npm install

# Copie du code source
COPY . .

# -------------------------
# 2. Développement
# -------------------------
FROM base AS development

# Ouvre le port 3000
EXPOSE 3000

# Commande pour démarrer en mode développement
CMD ["npm", "run", "dev"]

# -------------------------
# 3. Production (standalone)
# -------------------------
FROM base AS build

# Génération du build standalone
RUN npm run build && \
    mkdir -p .next/standalone/.next && \
    cp -r .next/static .next/standalone/.next/ && \
    cp -r public .next/standalone/

# -------------------------
# 4. Image finale de production
# -------------------------
FROM node:18 AS production

WORKDIR /app

# Copie du dossier standalone généré
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/standalone/.next/static ./.next/static
COPY --from=build /app/public ./public

# Ouvre le port 3000
EXPOSE 3000

# Lance l'application
CMD ["node", "server.js"]
