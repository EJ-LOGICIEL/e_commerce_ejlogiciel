FROM python:slim-bullseye

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Mise à jour de pip et installation des dépendances en une seule commande
COPY requirements.txt /app/
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    rm -rf /root/.cache

# Copie des fichiers de l'application
COPY . /app/

# Création du répertoire staticfiles
RUN mkdir -p /app/staticfiles

EXPOSE 8000

CMD [""]