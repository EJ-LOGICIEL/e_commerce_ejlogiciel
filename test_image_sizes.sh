#!/bin/bash

# Script pour tester la taille des images Docker après optimisation

echo "=== Test de la taille des images Docker ==="
echo ""

# Construire les images
echo "Construction des images Docker..."
docker-compose -f docker-compose.prod.yml build

# Vérifier la taille des images
echo ""
echo "Taille des images Docker:"
echo "------------------------"
docker images | grep -E 'e_commerce_ejlogiciel_frontend|e_commerce_ejlogiciel_backend'

echo ""
echo "=== Vérification des volumes et des médias ==="

# Démarrer les services en arrière-plan
echo "Démarrage des services..."
docker-compose -f docker-compose.prod.yml up -d

# Attendre que les services démarrent
echo "Attente du démarrage des services..."
sleep 10

# Vérifier que les volumes sont correctement montés
echo ""
echo "Vérification des volumes montés:"
echo "------------------------------"
docker-compose -f docker-compose.prod.yml exec backend ls -la /app/media
docker-compose -f docker-compose.prod.yml exec backend ls -la /app/static

# Vérifier que nginx peut accéder aux médias
echo ""
echo "Vérification de l'accès aux médias via Nginx:"
echo "-------------------------------------------"
docker-compose -f docker-compose.prod.yml exec nginx ls -la /var/www/media
docker-compose -f docker-compose.prod.yml exec nginx ls -la /var/www/static

# Arrêter les services
echo ""
echo "Arrêt des services..."
docker-compose -f docker-compose.prod.yml down

echo ""
echo "=== Test terminé ==="