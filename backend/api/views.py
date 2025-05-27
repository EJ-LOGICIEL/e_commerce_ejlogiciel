from django.db import transaction
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .custom_permissions import IsAdmin, IsAdminOrVendeur
from .models import (
    Utilisateur,
    Produit,
    Categorie,
    MethodePaiement,
    Cle,
)
from .serializers import (
    UserSerializer,
    ProduitSerializer,
    CategorieSerializer,
    MethodePaiementSerializer,
    ActionSerializer,
    ElementAchatDevisSerializer,
)
from .tasks import envoyer_cles_email_async, logger


class ClientSignUpAPIView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    queryset = Utilisateur.objects.all()
    serializer_class = UserSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    """Endpoint pour obtenir un token d'authentification JWT."""

    def post(self, request: Request, *args, **kwargs) -> Response:
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


class CustomTokenRefreshView(TokenRefreshView):
    """Endpoint pour rafraîchir un token d'authentification JWT."""

    def post(self, request: Request, *args, **kwargs) -> Response:
        request._full_data = {"refresh": request.COOKIES.get("refresh_token")}
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


class LogoutView(generics.GenericAPIView):
    """Endpoint pour déconnecter un utilisateur."""

    def post(self, request: Request, *args, **kwargs) -> Response:
        response = Response({"detail": "Successfully logged out."})
        response.delete_cookie("refresh_token")
        return response


# Catégories
class CategorieListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = CategorieSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAdmin()]

    def get_queryset(self):
        return Categorie.objects.all()


class RetrieveUpdateDestroyCategoryAPIView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdmin]
    queryset = Categorie.objects.all()
    serializer_class = CategorieSerializer
    lookup_field = "pk"


# Produits
class ProduitListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = ProduitSerializer
    filterset_fields = ["categorie", "prix"]

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAdmin()]

    def get_queryset(self):
        return Produit.objects.all()


class RetrieveUpdateDestroyProduitAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProduitSerializer
    lookup_field = "pk"

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAdmin()]

    def get_queryset(self):
        return Produit.objects.all()


# Méthodes de paiement
class MethodePaiementListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = MethodePaiementSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAdmin()]

    def get_queryset(self):
        return MethodePaiement.objects.all()


class MethodePaiementDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdmin]
    queryset = MethodePaiement.objects.all()
    serializer_class = MethodePaiementSerializer
    lookup_field = "pk"


# Actions


# cree une action manuellement
class ActionCreateAPIView(APIView):
    permission_classes = [IsAdminOrVendeur]

    @transaction.atomic
    def post(self, request: Request, *args, **kwargs) -> Response:
        action_data = request.data.get("action")
        produits_data = request.data.get("produits")

        if not action_data or not produits_data:
            return Response(
                {"error": "Données incomplètes. Action et produits requis."}, status=400
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

        for item in produits_data:
            produit_id = item["produit"]
            produit = produits_map[str(produit_id)]

            # Compter les clés disponibles pour ce produit
            count = Cle.objects.filter(produit=produit, disponiblite=True).count()
            if count < 2:
                return Response(
                    {
                        "error": f"Pas assez de clés disponibles pour {produit.nom}. Seulement {count} disponible(s)."
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

        cles_selectionnees = {}

        for item in produits_data:
            produit_id = item["produit"]
            produit = produits_map[str(produit_id)]

            # Sélectionner et verrouiller exactement 2 clés disponibles
            cles = Cle.objects.select_for_update().filter(
                produit=produit, disponiblite=True
            )[:2]

            cles_list = list(cles)

            if len(cles_list) < 2:
                logger.error(
                    f"Race condition détectée: clés pour {produit.nom} non disponibles"
                )
                return Response(
                    {
                        "error": f"Pas assez de clés disponibles pour {produit.nom}. Seulement {len(cles_list)} disponible(s)."
                    },
                    status=400,
                )

            cles_selectionnees[produit.nom] = []

            cle_ids = [cle.id for cle in cles_list]
            Cle.objects.filter(id__in=cle_ids).update(disponiblite=False)

            for cle in cles_list:
                cles_selectionnees[produit.nom].append(
                    {
                        "id": cle.id,
                        "contenue": cle.contenue,
                        "code_cle": cle.code_cle,
                        "validite": cle.validite,
                    }
                )

        client = Utilisateur.objects.get(id=action_data["client"])

        # 8. Envoyer les clés par email de manière asynchrone
        envoyer_cles_email_async.delay(
            client_id=client.id, action_id=action.id, cles_data=cles_selectionnees
        )

        return Response(
            {
                "detail": "Action créée avec succès. Les clés ont été envoyées par email.",
                "action_id": action.id,
                "cles": cles_selectionnees,
            }
        )
