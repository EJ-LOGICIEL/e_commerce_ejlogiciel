from rest_framework import serializers

from .models import (
    Utilisateur,
    Categorie,
    Produit,
    Cle,
    Action,
    MethodePaiement,
    ElementAchatDevis,
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
        ]
        extra_kwargs = {"password": {"write_only": True}}
        read_only_fields = ["code_utilisateur"]

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

    class Meta:
        model = ElementAchatDevis
        fields = ["id", "action", "produit", "quantite", "prix_total"]

    def create(self, validated_data):
        element_achat_devis = ElementAchatDevis.objects.create(**validated_data)
        return element_achat_devis


class ActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Action
        fields = [
            "id",
            "type",
            "prix",
            "date_action",
            "client",
            "vendeur",
            "methode_paiement",
            "code_action",
            "elements",
            "livree",
            "payee",
        ]
        read_only_fields = ["code_action", "date_action", "elements"]

    def create(self, validated_data):
        action = Action.objects.create(**validated_data)
        return action
