from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.db import transaction
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from .custom_permissions import IsAdmin
from .models import (
    Utilisateur,
    Produit,
    Categorie,
    MethodePaiement,
    Action,
    ElementAchatDevis,
    Cle,
)
from .serializers import (
    UserSerializer,
    ProduitSerializer,
    CategorieSerializer,
    MethodePaiementSerializer,
    ActionSerializer,
)


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


