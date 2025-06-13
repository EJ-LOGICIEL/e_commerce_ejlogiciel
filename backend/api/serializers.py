from rest_framework import serializers

from .models import (
    Utilisateur,
    Categorie,
    Produit,
    Cle,
    Action,
    MethodePaiement,
    ElementAchatDevis,
    Vendeur,
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = [
            "id",
            "username",
            "nom_complet",
            "email",
            "password",
            "type",
            "role",
            "numero_telephone",
            "adresse",
            "nif",
            "rcs",
            "stats",
            "code_utilisateur",
            "actions_client",
            "actions_vendeur",
        ]
        extra_kwargs = {"password": {"write_only": True}}
        read_only_fields = ["code_utilisateur, actions_client, actions_vendeur"]

    def create(self, validated_data):
        user = Utilisateur.objects.create_user(**validated_data)
        return user

    def update(self, instance, validated_data):
        if "password" in validated_data:
            password = validated_data.pop("password")
            instance.set_password(password)
        return super().update(instance, validated_data)


class CategorieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categorie
        fields = ["id", "nom", "description"]

    def create(self, validated_data):
        categorie = Categorie.objects.create(**validated_data)
        return categorie


class ProduitSerializer(serializers.ModelSerializer):

    class Meta:
        model = Produit
        fields = [
            "id",
            "nom",
            "description",
            "validite",
            "image",
            "prix_min",
            "prix",
            "prix_max",
            "categorie",
        ]

    def create(self, validated_data):
        produit = Produit.objects.create(**validated_data)
        return produit


class CleSerializer(serializers.ModelSerializer):
    validite = serializers.SerializerMethodField()

    class Meta:
        model = Cle
        fields = [
            "id",
            "contenue",
            "produit",
            "validite",
            "disponiblite",
            "code_cle",
        ]

    extra_kwargs = {"code_cle": {"write_only": True}}

    def get_validite(self, obj):
        return obj.produit.validite

    def create(self, validated_data):
        cle = Cle.objects.create(**validated_data)
        return cle


class MethodePaiementSerializer(serializers.ModelSerializer):
    class Meta:
        model = MethodePaiement
        fields = ["id", "nom", "description"]

    def create(self, validated_data):
        methode_paiement = MethodePaiement.objects.create(**validated_data)
        return methode_paiement


class ElementAchatDevisSerializer(serializers.ModelSerializer):
    prix_total = serializers.ReadOnlyField()

    class Meta:
        model = ElementAchatDevis
        fields = ["id", "action", "produit", "quantite", "prix_total"]

    def create(self, validated_data):
        # Récupérer le produit pour obtenir son prix
        produit = validated_data.get("produit")
        quantite = validated_data.get("quantite", 1)

        # Calculer le prix total basé sur le prix du produit et la quantité
        prix_total = produit.prix * quantite
        validated_data["prix_total"] = prix_total

        element_achat_devis = ElementAchatDevis.objects.create(**validated_data)
        return element_achat_devis


class ActionSerializer(serializers.ModelSerializer):
    elements_details = serializers.SerializerMethodField()
    client_name = serializers.SerializerMethodField()
    vendeur_name = serializers.SerializerMethodField()
    methode_paiement_name = serializers.SerializerMethodField()

    class Meta:
        model = Action
        fields = [
            "id",
            "type",
            "prix",
            "date_action",
            "client",
            "client_name",
            "vendeur",
            "vendeur_name",
            "methode_paiement",
            "methode_paiement_name",
            "code_action",
            "elements",
            "elements_details",
            "commentaire",
            "livree",
            "payee",
        ]
        read_only_fields = [
            "code_action",
            "date_action",
            "elements",
            "elements_details",
            "client_name",
            "vendeur_name",
            "methode_paiement_name",
        ]

    def get_elements_details(self, obj):
        elements = obj.elements.all()
        result = []
        for element in elements:
            produit = element.produit
            result.append(
                {
                    "id": element.id,
                    "produit_id": produit.id,
                    "produit_nom": produit.nom,
                    "quantite": element.quantite,
                    "prix_total": float(element.prix_total),
                    "prix_unitaire": float(produit.prix),
                }
            )
        return result

    def get_client_name(self, obj):
        return obj.client.nom_complet if obj.client else None

    def get_vendeur_name(self, obj):
        return obj.vendeur.nom_complet if obj.vendeur else None

    def get_methode_paiement_name(self, obj):
        return obj.methode_paiement.nom if obj.methode_paiement else None

    def create(self, validated_data):
        action = Action.objects.create(**validated_data)
        return action


class VendeurSerializer(serializers.ModelSerializer):
    utilisateur_details = UserSerializer(source="utilisateur", read_only=True)
    utilisateur_id = serializers.PrimaryKeyRelatedField(
        source="utilisateur",
        queryset=Utilisateur.objects.filter(role="vendeur"),
        write_only=True,
    )
    nombre_produits = serializers.SerializerMethodField()

    class Meta:
        model = Vendeur
        fields = [
            "id",
            "utilisateur_id",
            "utilisateur_details",
            "boutique_nom",
            "description",
            "logo",
            "date_inscription",
            "note_moyenne",
            "nombre_ventes",
            "commission_rate",
            "est_verifie",
            "nombre_produits",
        ]
        read_only_fields = ["date_inscription", "note_moyenne", "nombre_ventes"]

    def get_nombre_produits(self, obj):
        # This would require adding a ForeignKey from Produit to Vendeur
        # For now, return 0 as we haven't modified the Produit model yet
        return 0

    def create(self, validated_data):
        utilisateur = validated_data.pop("utilisateur")
        vendeur = Vendeur.objects.create(utilisateur=utilisateur, **validated_data)
        return vendeur
