from django.contrib.auth.models import AbstractUser
from django.db import models


class Utilisateur(AbstractUser):

    CHOIX_ROLE = [
        ("client", "Client"),
        ("vendeur", "Vendeur"),
        ("admin", "Admin"),
    ]
    email = models.EmailField()
    mot_de_passe = models.CharField(max_length=20)

    nom = models.CharField(max_length=30)
    prenom = models.CharField(max_length=30, null=True, blank=True)
    photo = models.ImageField(upload_to="photos/")
    role = models.CharField(max_length=100, choices=CHOIX_ROLE)
    numero_telephone = models.CharField(max_length=15)
    adresse = models.CharField(max_length=100)
    code_utilisateur = models.CharField(max_length=50, null=True, blank=True)

    nif = models.CharField(max_length=100, null=True, blank=True)
    stats = models.CharField(max_length=100, null=True, blank=True)
    rcs = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.nom

    def save(self, *args, **kwargs):
        self.code_utilisateur = f"{self.role}-{self.id}"
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"


class Categorie(models.Model):

    nom = models.CharField(max_length=100)
    description = models.TextField()

    def __str__(self):
        return self.nom


class Produit(models.Model):

    categorie = models.ForeignKey(
        Categorie, on_delete=models.CASCADE, related_name="produits"
    )
    nom = models.CharField(max_length=100)
    description = models.TextField()
    image = models.ImageField(upload_to="produits/")
    type = models.CharField(max_length=100)

    prix_min = models.DecimalField(max_digits=10, decimal_places=2)
    prix = models.DecimalField(max_digits=10, decimal_places=2)
    prix_max = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.nom} - {self.prix}"


class Cle(models.Model):

    CHOIX_VALIDITE = [
        ("1 ans", "1 ans"),
        ("2 ans", "2 ans"),
        ("3 ans", "3 ans"),
        ("a vie", "a vie"),
    ]

    contenue = models.CharField(max_length=100)
    produit = models.ForeignKey(
        Produit, on_delete=models.CASCADE, related_name="produits"
    )
    validite = models.CharField(max_length=10, choices=CHOIX_VALIDITE)
    disponiblite = models.BooleanField(default=True)
    code_cle = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return f"{self.categorie.nom} -{self.contenue[:4]}-****-{self.categorie.prix}"

    def save(self, *args, **kwargs):
        self.code_cle = f"{self.categorie.nom}-{self.id}"
        super().save(*args, **kwargs)


class Achat(models.Model):

    CHOIX_PAIEMENT = (
        ("espece", "Espèce"),
        ("mobile money", "Mobile Money"),
        ("virement", "Virement"),
    )
    acheteur = models.ForeignKey(
        Utilisateur, on_delete=models.CASCADE, related_name="achats"
    )
    quantite = models.PositiveIntegerField()
    prix_total = models.DecimalField(max_digits=10, decimal_places=2)
    date_achat = models.DateTimeField(auto_now_add=True)

    methode_paiement = models.CharField(max_length=100)
    status_paiement = models.BooleanField(default=False)
    date_paiement = models.DateTimeField(null=True, blank=True)
    code_achat = models.CharField(max_length=50, null=True, blank=True)

    est_livree = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.produit.nom} - {self.acheteur.nom}"

    def save(self, *args, **kwargs):
        self.numero_facture = f"achat-{self.id}"
        super().save(*args, **kwargs)


class Devis(models.Model):

    client = models.ForeignKey(
        Utilisateur, on_delete=models.CASCADE, related_name="devis"
    )
    date_creation = models.DateTimeField(auto_now_add=True)
    date_expiration = models.DateTimeField()
    est_valide = models.BooleanField(default=True)
    est_paye = models.BooleanField(default=False)
    est_livree = models.BooleanField(default=False)
    code_devis = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return f"{self.client.nom} - {self.date_creation}"

    def save(self, *args, **kwargs):
        self.code_devis = f"devis-{self.id}"
        super().save(*args, **kwargs)


class ElementAchatDevis(models.Model):
    achat = models.ForeignKey(
        Achat,
        on_delete=models.CASCADE,
        related_name="elements_achat",
        blank=True,
        null=True,
    )
    devis = models.ForeignKey(
        Devis,
        on_delete=models.CASCADE,
        related_name="elements_devis",
        blank=True,
        null=True,
    )
    produit = models.ForeignKey(
        Produit, on_delete=models.CASCADE, related_name="produits"
    )
    quantite = models.PositiveIntegerField(default=1)
    prix_total = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.cle.contenue} - {self.quantite}"
