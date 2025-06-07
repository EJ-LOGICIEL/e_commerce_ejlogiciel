import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from api.models import Utilisateur, Vendeur

def create_vendor_profiles():
    """Create vendor profiles for existing users with the 'vendeur' role."""
    vendors = Utilisateur.objects.filter(role='vendeur')
    created_count = 0
    existing_count = 0

    for user in vendors:
        vendor, created = Vendeur.objects.get_or_create(
            utilisateur=user,
            defaults={
                'boutique_nom': f"Boutique de {user.nom_complet}",
            }
        )

        if created:
            created_count += 1
            print(f"Created vendor profile for {user.nom_complet}")
        else:
            existing_count += 1
            print(f"Vendor profile already exists for {user.nom_complet}")

    print(f"\nSummary:")
    print(f"- Found {vendors.count()} users with 'vendeur' role")
    print(f"- Created {created_count} new vendor profiles")
    print(f"- {existing_count} vendor profiles already existed")

if __name__ == "__main__":
    create_vendor_profiles()
