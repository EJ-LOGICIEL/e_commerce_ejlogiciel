"""
Script pour créer un utilisateur administrateur
Usage: python create_admin.py <username> <email> <password>
"""
import os
import sys
import django

# Configurer l'environnement Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# Importer le modèle utilisateur après configuration
from api.models import Utilisateur

def create_admin_user(username, email, password):
    """Crée un utilisateur avec le rôle admin"""
    try:
        # Vérifier si l'utilisateur existe déjà
        if Utilisateur.objects.filter(username=username).exists():
            user = Utilisateur.objects.get(username=username)
            user.role = "admin"
            user.email = email
            user.set_password(password)
            user.save()
            print(f"Utilisateur {username} mis à jour avec le rôle admin")
        else:
            # Créer un nouvel utilisateur admin
            user = Utilisateur.objects.create_user(
                username=username,
                email=email,
                password=password,
                role="admin"  # Définir le rôle comme admin
            )
            print(f"Nouvel utilisateur admin créé : {username}")
        return True
    except Exception as e:
        print(f"Erreur lors de la création de l'utilisateur admin : {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python create_admin.py <username> <email> <password>")
        sys.exit(1)

    username = sys.argv[1]
    email = sys.argv[2]
    password = sys.argv[3]

    success = create_admin_user(username, email, password)
    sys.exit(0 if success else 1)
