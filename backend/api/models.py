import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models


class Utilisateur(AbstractUser):

    CHOIX_ROLE = [
        ("client", "Client"),
        ("vendeur", "Vendeur"),
        ("admin", "Admin"),
    ]

    CHOIX_TYPE = [
        ("particulier", "Particulier"),
        ("entreprise", "Entreprise"),
    ]

    nom_complet = models.CharField(max_length=30)
    role = models.CharField(max_length=100, choices=CHOIX_ROLE, default="client")
    type = models.CharField(max_length=20, choices=CHOIX_TYPE, default="particulier")
    numero_telephone = models.CharField(max_length=15)
    adresse = models.CharField(max_length=100)
    code_utilisateur = models.CharField(max_length=50, null=True, blank=True)

    nif = models.CharField(max_length=100, null=True, blank=True)
    stats = models.CharField(max_length=100, null=True, blank=True)
    rcs = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.nom_complet

    def save(self, *args, **kwargs):
        if not self.code_utilisateur:
            client_id = str(uuid.uuid4())[:5]
            self.code_utilisateur = f"{self.role.upper()}-{client_id}"
        super().save(*args, **kwargs)

        if self.role == "vendeur":
            Vendeur.objects.update_or_create(
                utilisateur=self,
                defaults={
                    "boutique_nom": f"Boutique de {self.nom_complet}",
                },
            )

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"


class Vendeur(models.Model):
    utilisateur = models.OneToOneField(
        Utilisateur, on_delete=models.CASCADE, related_name="vendeur_profile"
    )
    boutique_nom = models.CharField(max_length=100, default="Ma Boutique")
    description = models.TextField(blank=True, null=True)
    logo = models.ImageField(upload_to="vendeurs/logos/", blank=True, null=True)
    date_inscription = models.DateTimeField(auto_now_add=True)
    note_moyenne = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    nombre_ventes = models.PositiveIntegerField(default=0)
    commission_rate = models.DecimalField(
        max_digits=5, decimal_places=2, default=10.00
    )  # Pourcentage de commission
    est_verifie = models.BooleanField(default=False)

    def __str__(self):
        return f"Vendeur: {self.utilisateur.nom_complet} - {self.boutique_nom}"

    class Meta:
        verbose_name = "Vendeur"
        verbose_name_plural = "Vendeurs"


class Categorie(models.Model):

    nom = models.CharField(max_length=100)
    description = models.TextField()

    def __str__(self):
        return self.nom


class Produit(models.Model):

    CHOIX_VALIDITE = [
        ("1 ans", "1 ans"),
        ("2 ans", "2 ans"),
        ("3 ans", "3 ans"),
        ("a vie", "a vie"),
    ]

    categorie = models.ForeignKey(
        Categorie, on_delete=models.CASCADE, related_name="produits"
    )
    nom = models.CharField(max_length=100, unique=False)
    description = models.TextField()
    validite = models.CharField(max_length=10, choices=CHOIX_VALIDITE, default="1 ans")
    code_produit = models.CharField(max_length=50, null=True, blank=True)
    image = models.ImageField(upload_to="produits/")

    prix_min = models.DecimalField(max_digits=10, decimal_places=2)
    prix = models.DecimalField(max_digits=10, decimal_places=2)
    prix_max = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.nom} - {self.prix}"

    def save(self, *args, **kwargs):
        code = str(uuid.uuid4())[:5]
        if not self.code_produit:
            self.code_produit = f"{self.nom.upper()}-{code}"

        super().save(*args, **kwargs)


class Cle(models.Model):

    contenue = models.CharField(max_length=100)
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE, related_name="cles")
    disponiblite = models.BooleanField(default=True)
    code_cle = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return f"{self.produit.nom} - {self.contenue[:4]}-****-{self.produit.prix}"

    def save(self, *args, **kwargs):
        if not self.code_cle:
            code = str(uuid.uuid4())[:5]
            self.code_cle = f"{self.produit.nom}-{code}"
        super().save(*args, **kwargs)


class MethodePaiement(models.Model):
    nom = models.CharField(max_length=100)
    description = models.TextField()

    def __str__(self):
        return self.nom


class Action(models.Model):
    CHOIX_TYPE = [
        ("achat", "Achat"),
        ("devis", "Devis"),
    ]

    type = models.CharField(max_length=10, choices=CHOIX_TYPE)
    prix = models.DecimalField(max_digits=10, decimal_places=2)
    commentaire = models.TextField(null=True, blank=True)
    date_action = models.DateTimeField(auto_now_add=True)
    livree = models.BooleanField(default=False)
    payee = models.BooleanField(default=False)

    client = models.ForeignKey(
        Utilisateur, on_delete=models.CASCADE, related_name="actions_client"
    )
    vendeur = models.ForeignKey(
        Utilisateur,
        on_delete=models.CASCADE,
        related_name="actions_vendeur",
        blank=True,
        null=True,
    )
    methode_paiement = models.ForeignKey(
        MethodePaiement, on_delete=models.CASCADE, related_name="actions"
    )

    code_action = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return f"{self.type} - {self.client.nom_complet} - {self.code_action}"

    def save(self, *args, **kwargs):
        if not self.code_action:
            code = str(uuid.uuid4())[:5]
            self.code_action = f"ej-{self.type}-{code}"
        super().save(*args, **kwargs)


class ElementAchatDevis(models.Model):

    action = models.ForeignKey(
        Action,
        on_delete=models.CASCADE,
        related_name="elements",
        blank=True,
        null=True,
    )

    produit = models.ForeignKey(
        Produit, on_delete=models.CASCADE, related_name="elements_achat_devis"
    )
    quantite = models.PositiveIntegerField(default=1)
    prix_total = models.DecimalField(max_digits=10, decimal_places=2)


class EmailEchec(models.Model):

    client = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
    action = models.ForeignKey(Action, on_delete=models.CASCADE)
    date_echec = models.DateTimeField(auto_now_add=True)
    erreur = models.TextField()
    donnees = models.TextField()
    resolu = models.BooleanField(default=False)

    def __str__(self):
        return f"Échec email pour {self.client.email} - {self.date_echec}"
