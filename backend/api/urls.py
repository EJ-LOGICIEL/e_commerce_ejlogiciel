from django.urls import path

from .views import (
    ClientSignUpAPIView,
    CustomTokenObtainPairView,
    CustomTokenRefreshView,
    LogoutView,
    CategorieListCreateAPIView,
    RetrieveUpdateDestroyCategoryAPIView,
    ProduitListCreateAPIView,
    RetrieveUpdateDestroyProduitAPIView,
    MethodePaiementListCreateAPIView,
    MethodePaiementDetailAPIView,
)

urlpatterns = [
    # Authentication
    path("signup/", ClientSignUpAPIView.as_view(), name="signup"),
    path("token/", CustomTokenObtainPairView.as_view(), name="login"),
    path("refresh/", CustomTokenRefreshView.as_view(), name="refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    # Categories
    path(
        "categories/",
        CategorieListCreateAPIView.as_view(),
        name="categorie-list-create",
    ),
    path(
        "categories/<int:pk>/",
        RetrieveUpdateDestroyCategoryAPIView.as_view(),
        name="categorie-retrieve-update-destroy",
    ),
    # Produits
    path("produits/", ProduitListCreateAPIView.as_view(), name="produit-list-create"),
    path(
        "produits/<int:pk>/",
        RetrieveUpdateDestroyProduitAPIView.as_view(),
        name="produit-retrieve-update-destroy",
    ),
    # Methode Paiement
    path(
        "methode-paiement/",
        MethodePaiementListCreateAPIView.as_view(),
        name="methode-paiement-list-create",
    ),
    path(
        "methode-paiement/<int:pk>/",
        MethodePaiementDetailAPIView.as_view(),
        name="methode-paiement-detail",
    ),
]
