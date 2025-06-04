from datetime import datetime, timedelta

from django.db import transaction
from django.db.models import Sum, Count
from drf_spectacular.utils import (
    extend_schema,
    extend_schema_view,
    OpenApiParameter,
)
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .custom_permissions import IsAdmin, IsAdminOrVendeur, IsVendeur
from .models import (
    Utilisateur,
    Produit,
    Categorie,
    MethodePaiement,
    Cle,
    Action,
    ElementAchatDevis,
)
from .serializers import (
    UserSerializer,
    ProduitSerializer,
    CategorieSerializer,
    MethodePaiementSerializer,
    ActionSerializer,
    ElementAchatDevisSerializer,
    CleSerializer,
)
from .tasks import envoyer_cles_email_async, logger


# Authentification


@extend_schema(
    tags=["Authentication"],
    summary="Inscription d'un nouveau client",
    description="Permet à un utilisateur de s'inscrire en tant que client.",
    responses={201: UserSerializer},
)
class UserSignUpAPIView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    queryset = Utilisateur.objects.all()
    serializer_class = UserSerializer

    def post(self, request, *args, **kwargs):
        res: Response = super().post(request, *args, **kwargs)
        if res.status_code == 201:
            user = Utilisateur.objects.get(id=res.data["id"])
            refresh = RefreshToken.for_user(user)
            res.set_cookie(
                key="refresh_token",
                value=str(refresh),
                httponly=True,
                max_age=3600 * 24 * 7,
                secure=True,
                samesite="Lax",
            )
            access_token = str(refresh.access_token)
            res = Response({"token": access_token, "user": UserSerializer(user).data})
        return res


@extend_schema(
    tags=["Authentication"],
    summary="Connexion utilisateur",
    description="Authentifie un utilisateur et retourne un token d'accès JWT (access token).",
    responses={200: {"type": "object", "properties": {"access": {"type": "string"}}}},
)
class CustomTokenObtainPairView(TokenObtainPairView):
    """Endpoint pour obtenir un token d'authentification JWT."""

    def post(self, request: Request, *args, **kwargs) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.user
        access_token = serializer.validated_data["access"]
        refresh_token = serializer.validated_data["refresh"]

        user_data = {
            "id": user.id,
            "username": user.username,
            "nom_complet": user.nom_complet,
            "role": user.role,
            "type": user.type,
            "numero_telephone": user.numero_telephone,
            "adresse": user.adresse,
            "email": user.email,
            "code_utilisateur": user.code_utilisateur,
            "nif": user.nif,
            "stats": user.stats,
            "rcs": user.rcs,
        }

        res = Response(
            {
                "token": access_token,
                "user": user_data,
            }
        )

        res.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            max_age=3600 * 24 * 7,  # 7 jours
            secure=True,
            samesite="Lax",
        )

        return res


@extend_schema(
    tags=["Authentication"],
    summary="Rafraîchir le token JWT",
    description="Utilise le refresh token pour obtenir un nouveau token d'accès.",
    responses={
        200: {"type": "object", "properties": {"access": {"type": "string"}}},
        401: {"description": "Refresh token invalide ou expiré"},
    },
)
class CustomTokenRefreshView(TokenRefreshView):
    """Endpoint pour rafraîchir un token d'authentification JWT."""

    def post(self, request: Request, *args, **kwargs) -> Response:
        request._full_data = {"refresh": request.COOKIES.get("refresh_token")}
        print(request)
        res: Response = super().post(request, *args, **kwargs)
        refresh_token = res.data.pop("refresh")

        res.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            max_age=36000 * 24 * 7,
            secure=True,
        )
        return res


class UserInfoAPIView(APIView):
    """Endpoint pour obtenir les informations de l'utilisateur connecté."""

    def get(self, request: Request, *args, **kwargs) -> Response:
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


@extend_schema(
    tags=["Authentication"],
    summary="Déconnexion",
    description="Déconnecte l'utilisateur en supprimant le refresh token.",
    responses={200: {"description": "Déconnexion réussie"}},
)
class LogoutView(APIView):
    """Endpoint pour déconnecter un utilisateur."""

    def post(self, request: Request, *args, **kwargs) -> Response:
        response = Response({"detail": "Successfully logged out."})
        response.delete_cookie("refresh_token")
        return response


# Produits
@extend_schema_view(
    list=extend_schema(
        tags=["Produits"],
        summary="Liste tous les produits",
        description="Retourne une liste de tous les produits disponibles.",
        parameters=[
            OpenApiParameter(
                name="categorie",
                description="Filtrer par ID de catégorie",
                required=False,
                type=int,
            ),
            OpenApiParameter(
                name="prix_min",
                description="Prix minimum",
                required=False,
                type=float,
            ),
            OpenApiParameter(
                name="prix_max",
                description="Prix maximum",
                required=False,
                type=float,
            ),
        ],
    ),
    create=extend_schema(
        tags=["Produits"],
        summary="Crée un nouveau produit",
        description="Crée un nouveau produit (réservé aux administrateurs).",
    ),
)
class ProduitListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = ProduitSerializer
    filterset_fields = ["categorie", "prix"]
    ordering_fields = ["nom", "prix"]
    ordering = ["nom"]

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAdmin()]

    def get_queryset(self):
        return Produit.objects.all()


@extend_schema_view(
    retrieve=extend_schema(
        tags=["Produits"],
        summary="Récupère un produit",
        description="Récupère les détails d'un produit spécifique.",
    ),
    update=extend_schema(
        tags=["Produits"],
        summary="Met à jour un produit",
        description="Met à jour les détails d'un produit (réservé aux administrateurs).",
    ),
    destroy=extend_schema(
        tags=["Produits"],
        summary="Supprime un produit",
        description="Supprime un produit (réservé aux administrateurs).",
    ),
)
class RetrieveUpdateDestroyProduitAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProduitSerializer
    lookup_field = "pk"

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAdmin()]

    def get_queryset(self):
        return Produit.objects.all()


# cle
@extend_schema_view(
    list=extend_schema(
        tags=["Clés"],
        summary="Liste toutes les clés",
        description="Retourne une liste de toutes les clés disponibles.",
        parameters=[
            OpenApiParameter(
                name="produit",
                description="Filtrer par ID de produit",
                required=False,
                type=int,
            ),
            OpenApiParameter(
                name="disponiblite",
                description="Filtrer par disponibilité",
                required=False,
                type=bool,
            ),
        ],
    ),
    create=extend_schema(
        tags=["Clés"],
        summary="Crée une nouvelle clé",
        description="Crée une nouvelle clé (réservé aux administrateurs).",
    ),
)
class CleListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = CleSerializer
    filterset_fields = ["produit", "disponiblite"]
    ordering_fields = ["produit", "disponiblite"]
    ordering = ["produit"]

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsVendeur()]
        return [IsAdmin()]

    def get_queryset(self):
        return Cle.objects.all()


@extend_schema_view(
    retrieve=extend_schema(
        tags=["Clés"],
        summary="Récupère une clé",
        description="Récupère les détails d'une clé spécifique.",
    ),
    update=extend_schema(
        tags=["Clés"],
        summary="Met à jour une clé",
        description="Met à jour les détails d'une clé (réservé aux administrateurs).",
    ),
    destroy=extend_schema(
        tags=["Clés"],
        summary="Supprime une clé",
        description="Supprime une clé (réservé aux administrateurs).",
    ),
)
class RetrieveUpdateDestroyCleAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CleSerializer
    lookup_field = "pk"

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsVendeur()]
        return [IsAdmin()]

    def get_queryset(self):
        return Cle.objects.all()


# Catégories
@extend_schema_view(
    list=extend_schema(
        tags=["Catégories"],
        summary="Liste toutes les catégories",
        description="Retourne une liste de toutes les catégories disponibles.",
    ),
    create=extend_schema(
        tags=["Catégories"],
        summary="Crée une nouvelle catégorie",
        description="Crée une nouvelle catégorie (réservé aux administrateurs).",
    ),
)
class CategorieListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = CategorieSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAdmin()]

    def get_queryset(self):
        return Categorie.objects.all()


@extend_schema_view(
    retrieve=extend_schema(
        tags=["Catégories"],
        summary="Récupère une catégorie",
        description="Récupère les détails d'une catégorie spécifique.",
    ),
    update=extend_schema(
        tags=["Catégories"],
        summary="Met à jour une catégorie",
        description="Met à jour les détails d'une catégorie (réservé aux administrateurs).",
    ),
    destroy=extend_schema(
        tags=["Catégories"],
        summary="Supprime une catégorie",
        description="Supprime une catégorie (réservé aux administrateurs).",
    ),
)
class RetrieveUpdateDestroyCategoryAPIView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdmin]
    queryset = Categorie.objects.all()
    serializer_class = CategorieSerializer
    lookup_field = "pk"


# Méthodes de paiement
@extend_schema_view(
    list=extend_schema(
        tags=["Méthodes de paiement"],
        summary="Liste toutes les méthodes de paiement",
        description="Retourne une liste de toutes les méthodes de paiement disponibles.",
    ),
    create=extend_schema(
        tags=["Méthodes de paiement"],
        summary="Crée une nouvelle méthode de paiement",
        description="Crée une nouvelle méthode de paiement (réservé aux administrateurs).",
    ),
)
class MethodePaiementListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = MethodePaiementSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAdmin()]

    def get_queryset(self):
        return MethodePaiement.objects.all()


@extend_schema_view(
    retrieve=extend_schema(
        tags=["Méthodes de paiement"],
        summary="Récupère une méthode de paiement",
        description="Récupère les détails d'une méthode de paiement spécifique.",
    ),
    update=extend_schema(
        tags=["Méthodes de paiement"],
        summary="Met à jour une méthode de paiement",
        description="Met à jour les détails d'une méthode de paiement (réservé aux administrateurs).",
    ),
    destroy=extend_schema(
        tags=["Méthodes de paiement"],
        summary="Supprime une méthode de paiement",
        description="Supprime une méthode de paiement (réservé aux administrateurs).",
    ),
)
class MethodePaiementDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdmin]
    queryset = MethodePaiement.objects.all()
    serializer_class = MethodePaiementSerializer
    lookup_field = "pk"


# Actions


# cree une action manuellement
@extend_schema(
    tags=["Actions"],
    summary="Crée une nouvelle action (achat ou devis)",
    description="Crée une nouvelle action (achat ou devis), attribue des clés pour les achats et envoie un email.",
    request={
        "application/json": {
            "example": {
                "action": {
                    "type": "achat ou devis",
                    "prix": 1000,
                    "client": 1,
                    "methode_paiement": 1,
                },
                "produits": [
                    {"produit": 1, "quantite": 1, "prix_total": 500},
                    {"produit": 2, "quantite": 1, "prix_total": 500},
                ],
            }
        }
    },
    responses={
        200: {"description": "Action créée avec succès"},
        400: {"description": "Données invalides ou pas assez de clés disponibles"},
        401: {"description": "Non authentifié"},
        403: {"description": "Permission refusée"},
    },
)
class ActionCreateAPIView(APIView):
    permission_classes = [IsAdminOrVendeur]

    @transaction.atomic
    def post(self, request: Request, *args, **kwargs) -> Response:
        action_data = request.data.get("action")
        type_action = action_data.get("type", "").upper()
        print(type_action)
        produits_data = request.data.get("produits")

        if not action_data or not produits_data:
            return Response(
                {"error": "Données incomplètes. Action et produits requis."}, status=400
            )

        if type_action not in ["ACHAT", "DEVIS"]:
            return Response(
                {"error": "Type d'action invalide. Doit être 'ACHAT' ou 'DEVIS'."},
                status=400,
            )

        # Préchargement des produits en une seule requête
        produit_ids = [item["produit"] for item in produits_data]
        produits_map = {
            str(p.id): p for p in Produit.objects.filter(id__in=produit_ids)
        }

        if len(produits_map) != len(produit_ids):
            return Response({"error": "Certains produits n'existent pas."}, status=400)

        action_serializer = ActionSerializer(data=action_data)
        if not action_serializer.is_valid():
            return Response(action_serializer.errors, status=400)

        # Pour les achats, vérifier la disponibilité des clés
        if type_action == "ACHAT":
            for item in produits_data:
                produit_id = item["produit"]
                produit = produits_map[str(produit_id)]
                quantite = item.get("quantite", 1)

                # Compter les clés disponibles pour ce produit
                count = Cle.objects.filter(produit=produit, disponiblite=True).count()
                if count < quantite:
                    return Response(
                        {
                            "error": f"Pas assez de clés disponibles pour {produit.nom}. "
                            f"Seulement {count} disponible(s) pour {quantite} demandée(s)."
                        },
                        status=400,
                    )

        action = action_serializer.save(vendeur=request.user)

        elements_data = []
        for item in produits_data:
            item["action"] = action.id
            elements_data.append(item)

        elements_serializer = ElementAchatDevisSerializer(data=elements_data, many=True)
        if not elements_serializer.is_valid():
            return Response(elements_serializer.errors, status=400)

        elements_serializer.save()

        # Préparer les données pour l'email
        cles_selectionnees = {}

        # Pour les achats, attribuer des clés
        if type_action == "ACHAT":
            for item in produits_data:
                produit_id = item["produit"]
                produit = produits_map[str(produit_id)]
                quantite = item.get("quantite", 1)

                cles = Cle.objects.select_for_update().filter(
                    produit=produit, disponiblite=True
                )[:quantite]

                cles_list = list(cles)

                if len(cles_list) < quantite:
                    logger.error(
                        f"Race condition détectée: clés pour {produit.nom} non disponibles"
                    )
                    return Response(
                        {
                            "error": f"Pas assez de clés disponibles pour {produit.nom}. "
                            f"Seulement {len(cles_list)} disponible(s) pour {quantite} demandée(s)."
                        },
                        status=400,
                    )

                if produit.nom not in cles_selectionnees:
                    cles_selectionnees[produit.nom] = []

                cle_ids = [cle.id for cle in cles_list]
                Cle.objects.filter(id__in=cle_ids).update(disponiblite=False)

                for cle in cles_list:
                    cles_selectionnees[produit.nom].append(
                        {
                            "id": cle.id,
                            "contenue": cle.contenue,
                            "code_cle": cle.code_cle,
                            "validite": produit.validite,
                        }
                    )
        # Pour les devis, juste lister les produits sans attribuer de clés
        else:
            for item in produits_data:
                produit_id = item["produit"]
                produit = produits_map[str(produit_id)]
                quantite = item.get("quantite", 1)

                cles_selectionnees[produit.nom] = []

                for _ in range(quantite):
                    cles_selectionnees[produit.nom].append(
                        {
                            "id": None,
                            "contenue": "À attribuer lors de l'achat",
                            "code_cle": "N/A",
                            "validite": produit.validite,
                        }
                    )

        client = Utilisateur.objects.get(id=action_data["client"])

        envoyer_cles_email_async.delay(
            client_id=client.id, action_id=action.id, cles_data=cles_selectionnees
        )

        message = "Action créée avec succès. "
        if type_action == "ACHAT":
            message += "Les clés ont été envoyées par email."
        else:
            message += "Le devis a été envoyé par email."

        return Response(
            {
                "detail": message,
                "action_id": action.id,
                "cles": cles_selectionnees,
            }
        )


@extend_schema(
    tags=["Statistiques"],
    summary="Statistiques du tableau de bord",
    description="Fournit des statistiques globales pour le tableau de bord administrateur.",
    responses={
        200: {
            "type": "object",
            "properties": {
                "total_users": {"type": "integer"},
                "total_products": {"type": "integer"},
                "total_actions": {"type": "integer"},
                "recent_sales": {
                    "type": "object",
                    "properties": {
                        "total": {"type": "number"},
                        "count": {"type": "integer"},
                    },
                },
                "top_products": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "produit__nom": {"type": "string"},
                            "total_sales": {"type": "integer"},
                        },
                    },
                },
                "top_clients": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "client__nom_complet": {"type": "string"},
                            "total_purchases": {"type": "integer"},
                            "total_spent": {"type": "number"},
                        },
                    },
                },
            },
        }
    },
)
class DashboardStatsAPIView(APIView):
    """Fournit des statistiques pour le tableau de bord administrateur."""

    permission_classes = [IsAdmin]

    def get(self, request):
        today = datetime.today().date()
        thirty_days_ago = today - timedelta(days=30)

        total_users = Utilisateur.objects.count()
        total_products = Produit.objects.count()
        total_actions = Action.objects.count()

        recent_sales = Action.objects.filter(
            type="ACHAT", date_action__gte=thirty_days_ago
        ).aggregate(total=Sum("prix"), count=Count("id"))

        top_products = (
            ElementAchatDevis.objects.values("produit__nom")
            .annotate(total_sales=Count("id"))
            .order_by("-total_sales")[:5]
        )

        top_clients = (
            Action.objects.values("client__nom_complet")
            .annotate(total_purchases=Count("id"), total_spent=Sum("prix"))
            .order_by("-total_purchases")[:5]
        )

        return Response(
            {
                "total_users": total_users,
                "total_products": total_products,
                "total_actions": total_actions,
                "recent_sales": recent_sales,
                "top_products": top_products,
                "top_clients": top_clients,
            }
        )
