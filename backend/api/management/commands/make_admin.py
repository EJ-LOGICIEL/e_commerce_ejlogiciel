from django.core.management.base import BaseCommand
from api.models import Utilisateur

class Command(BaseCommand):
    help = 'Attribue le rôle d\'administrateur à un utilisateur par son email'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='Email de l\'utilisateur')

    def handle(self, *args, **options):
        email = options['email']

        try:
            user = Utilisateur.objects.get(email=email)
            user.role = 'admin'
            user.save()
            self.stdout.write(self.style.SUCCESS(f'L\'utilisateur {email} est maintenant administrateur'))
        except Utilisateur.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'Aucun utilisateur trouvé avec l\'email {email}'))
