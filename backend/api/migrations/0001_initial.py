# Generated by Django 5.2.1 on 2025-05-24 14:01

import django.contrib.auth.models
import django.contrib.auth.validators
import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("auth", "0012_alter_user_first_name_max_length"),
    ]

    operations = [
        migrations.CreateModel(
            name="Categorie",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("nom", models.CharField(max_length=100)),
                ("description", models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name="MethodePaiement",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("nom", models.CharField(max_length=100)),
                ("description", models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name="Utilisateur",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("password", models.CharField(max_length=128, verbose_name="password")),
                (
                    "last_login",
                    models.DateTimeField(
                        blank=True, null=True, verbose_name="last login"
                    ),
                ),
                (
                    "is_superuser",
                    models.BooleanField(
                        default=False,
                        help_text="Designates that this user has all permissions without explicitly assigning them.",
                        verbose_name="superuser status",
                    ),
                ),
                (
                    "username",
                    models.CharField(
                        error_messages={
                            "unique": "A user with that username already exists."
                        },
                        help_text="Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.",
                        max_length=150,
                        unique=True,
                        validators=[
                            django.contrib.auth.validators.UnicodeUsernameValidator()
                        ],
                        verbose_name="username",
                    ),
                ),
                (
                    "first_name",
                    models.CharField(
                        blank=True, max_length=150, verbose_name="first name"
                    ),
                ),
                (
                    "last_name",
                    models.CharField(
                        blank=True, max_length=150, verbose_name="last name"
                    ),
                ),
                (
                    "email",
                    models.EmailField(
                        blank=True, max_length=254, verbose_name="email address"
                    ),
                ),
                (
                    "is_staff",
                    models.BooleanField(
                        default=False,
                        help_text="Designates whether the user can log into this admin site.",
                        verbose_name="staff status",
                    ),
                ),
                (
                    "is_active",
                    models.BooleanField(
                        default=True,
                        help_text="Designates whether this user should be treated as active. Unselect this instead of deleting accounts.",
                        verbose_name="active",
                    ),
                ),
                (
                    "date_joined",
                    models.DateTimeField(
                        default=django.utils.timezone.now, verbose_name="date joined"
                    ),
                ),
                ("nom", models.CharField(max_length=30)),
                ("prenom", models.CharField(blank=True, max_length=30, null=True)),
                (
                    "role",
                    models.CharField(
                        choices=[
                            ("client", "Client"),
                            ("vendeur", "Vendeur"),
                            ("admin", "Admin"),
                        ],
                        default="client",
                        max_length=100,
                    ),
                ),
                ("numero_telephone", models.CharField(max_length=15)),
                ("adresse", models.CharField(max_length=100)),
                (
                    "code_utilisateur",
                    models.CharField(blank=True, max_length=50, null=True),
                ),
                ("nif", models.CharField(blank=True, max_length=100, null=True)),
                ("stats", models.CharField(blank=True, max_length=100, null=True)),
                ("rcs", models.CharField(blank=True, max_length=100, null=True)),
                (
                    "groups",
                    models.ManyToManyField(
                        blank=True,
                        help_text="The groups this user belongs to. A user will get all permissions granted to each of their groups.",
                        related_name="user_set",
                        related_query_name="user",
                        to="auth.group",
                        verbose_name="groups",
                    ),
                ),
                (
                    "user_permissions",
                    models.ManyToManyField(
                        blank=True,
                        help_text="Specific permissions for this user.",
                        related_name="user_set",
                        related_query_name="user",
                        to="auth.permission",
                        verbose_name="user permissions",
                    ),
                ),
            ],
            options={
                "verbose_name": "Utilisateur",
                "verbose_name_plural": "Utilisateurs",
            },
            managers=[
                ("objects", django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name="Action",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "type",
                    models.CharField(
                        choices=[("achat", "Achat"), ("devis", "Devis")], max_length=10
                    ),
                ),
                ("prix", models.DecimalField(decimal_places=2, max_digits=10)),
                ("date_action", models.DateTimeField(auto_now_add=True)),
                ("livree", models.BooleanField(default=False)),
                ("payee", models.BooleanField(default=False)),
                ("code_action", models.CharField(blank=True, max_length=50, null=True)),
                (
                    "client",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="actions_client",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "vendeur",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="actions_vendeur",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "methode_paiement",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="actions",
                        to="api.methodepaiement",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Produit",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("nom", models.CharField(max_length=100)),
                ("description", models.TextField()),
                ("image", models.ImageField(upload_to="produits/")),
                ("prix_min", models.DecimalField(decimal_places=2, max_digits=10)),
                ("prix", models.DecimalField(decimal_places=2, max_digits=10)),
                ("prix_max", models.DecimalField(decimal_places=2, max_digits=10)),
                (
                    "categorie",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="produits",
                        to="api.categorie",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="ElementAchatDevis",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("quantite", models.PositiveIntegerField(default=1)),
                ("prix_total", models.DecimalField(decimal_places=2, max_digits=10)),
                (
                    "action",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="elements",
                        to="api.action",
                    ),
                ),
                (
                    "produit",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="elements_achat_devis",
                        to="api.produit",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Cle",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("contenue", models.CharField(max_length=100)),
                (
                    "validite",
                    models.CharField(
                        choices=[
                            ("1 ans", "1 ans"),
                            ("2 ans", "2 ans"),
                            ("3 ans", "3 ans"),
                            ("a vie", "a vie"),
                        ],
                        max_length=10,
                    ),
                ),
                ("disponiblite", models.BooleanField(default=True)),
                ("code_cle", models.CharField(blank=True, max_length=50, null=True)),
                (
                    "produit",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="produits",
                        to="api.produit",
                    ),
                ),
            ],
        ),
    ]
