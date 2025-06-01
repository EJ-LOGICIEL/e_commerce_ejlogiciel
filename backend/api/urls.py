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
    CleListCreateAPIView,
    RetrieveUpdateDestroyCleAPIView,
    ActionCreateAPIView,
    DashboardStatsAPIView,
    ClientListCreateAPIView,
    ClientRetrieveUpdateDestroyAPIView,
)

urlpatterns = [
    # Authentication
    path("signup/", ClientSignUpAPIView.as_view(), name="signup"),
    path("token/", CustomTokenObtainPairView.as_view(), name="login"),
    path("refresh/", CustomTokenRefreshView.as_view(), name="refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    # Produits
    path("produits/", ProduitListCreateAPIView.as_view(), name="produit-list-create"),
    path(
        "produits/<int:pk>/",
        RetrieveUpdateDestroyProduitAPIView.as_view(),
        name="produit-retrieve-update-destroy",
    ),
    # Clés
    path("cles/", CleListCreateAPIView.as_view(), name="cle-list-create"),
    path(
        "cles/<int:pk>/", RetrieveUpdateDestroyCleAPIView.as_view(), name="cle-detail"
    ),
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
    # action
    path("actions/", ActionCreateAPIView.as_view(), name="action-create"),
    # stats
    path("stats/", DashboardStatsAPIView.as_view(), name="dashboard-stats"),
    # Clients (CRUD)
    path("clients/", ClientListCreateAPIView.as_view(), name="client-list-create"),
    path("clients/<int:pk>/", ClientRetrieveUpdateDestroyAPIView.as_view(), name="client-detail"),
]
