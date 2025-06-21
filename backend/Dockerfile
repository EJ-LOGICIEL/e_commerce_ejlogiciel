FROM python:3.12-slim-bullseye

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Installer les dépendances système
RUN apt-get update && apt-get install -y \
    build-essential curl libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Ajouter le dossier de l'application
WORKDIR /app

# Copier les fichiers de configuration
COPY pyproject.toml ./

# Créer un environnement virtuel
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copier le reste des fichiers
COPY . .

RUN mkdir -p logs

# Installer les dépendances
RUN pip install --no-cache-dir -U pip && \
    pip install --no-cache-dir . && \
    pip install --no-cache-dir gunicorn

# Exposer le port 8001
EXPOSE 8001

# Lancer Django avec gunicorn pour les tests
CMD ["gunicorn", "--bind", "0.0.0.0:8001", "--workers", "3", "--timeout", "120", "--keep-alive", "5", "config.wsgi:application"]
