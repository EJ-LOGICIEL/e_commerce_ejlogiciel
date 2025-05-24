from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .custom_permissions import IsAdmin
from .models import Utilisateur, Produit
from .serializers import UserSerializer, ProduitSerializer


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


# Client : Produit
class ListProductsAPIView(generics.ListAPIView):
    permission_classes = [AllowAny]
    queryset = Produit.objects.all()
    serializer_class = ProduitSerializer
    filterset_fields = ["categorie", "prix"]


class ProductDetailAPIView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    queryset = Produit.objects.all()
    serializer_class = ProduitSerializer
    lookup_field = "pk"


# Admin : Produit
class CreateProductAPIView(generics.CreateAPIView):
    permission_classes = [IsAdmin]
    queryset = Produit.objects.all()
    serializer_class = ProduitSerializer


class RetrieveUpdateDestroyProductAPIView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdmin]
    queryset = Produit.objects.all()
    serializer_class = ProduitSerializer
    lookup_field = "pk"
