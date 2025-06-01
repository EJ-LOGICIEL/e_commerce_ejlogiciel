# Étape 1: Builder pour les dépendances Python
FROM python:3.12-slim as builder

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Installer les dépendances build nécessaires
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev && \
    rm -rf /var/lib/apt/lists/*

# Installer uv
RUN pip install --no-cache-dir uv

# Copier les fichiers de dépendances
COPY pyproject.toml uv.lock ./

# Installer les dépendances dans un virtualenv
RUN uv venv -p python3.12 /opt/venv && \
    . /opt/venv/bin/activate && \
    uv pip install --no-cache-dir -e .

# Étape 2: Image finale
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app

# Installer les dépendances runtime et gunicorn en une seule couche
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libpq5 && \
    rm -rf /var/lib/apt/lists/* && \
    pip install --no-cache-dir gunicorn

# Créer le dossier pour les logs
RUN mkdir -p /app/logs && \
    chmod 777 /app/logs

# Copier l'environnement virtuel depuis le builder
COPY --from=builder /opt/venv /opt/venv

# Copier le code de l'application
COPY . .

# Exposer le port
EXPOSE 8001

# Commande par défaut
CMD ["gunicorn", "--bind", "0.0.0.0:8001", "--workers", "4", "your_project.wsgi:application"]