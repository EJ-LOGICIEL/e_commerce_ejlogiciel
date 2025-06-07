from django.urls import path

from .views import (
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
    ActionListAPIView,
    ActionRetrieveUpdateDestroyAPIView,
    DashboardStatsAPIView,
    UserInfoAPIView,
    UserSignUpAPIView,
    UserListCreateAPIView,
    UserRetrieveUpdateDestroyAPIView,
    ListElementAchatDevisAPIView,
    UserUpdateAPIView,
)

urlpatterns = [
    # Authentication
    path("signup/", UserSignUpAPIView.as_view(), name="signup"),
    path("token/", CustomTokenObtainPairView.as_view(), name="login"),
    path("refresh/", CustomTokenRefreshView.as_view(), name="refresh"),
    path("me/", UserInfoAPIView.as_view(), name="user-info"),
    path("logout/", LogoutView.as_view(), name="logout"),
    # user update
    path("me/update/", UserUpdateAPIView.as_view(), name="user-update"),
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
    # Users
    path("users/", UserListCreateAPIView.as_view(), name="user-list-create"),
    path(
        "users/<int:pk>/",
        UserRetrieveUpdateDestroyAPIView.as_view(),
        name="user-retrieve-update-destroy",
    ),
    # Actions
    path("actions/", ActionListAPIView.as_view(), name="action-list"),
    path("actions/create/", ActionCreateAPIView.as_view(), name="action-create"),
    path(
        "actions/<int:pk>/",
        ActionRetrieveUpdateDestroyAPIView.as_view(),
        name="action-retrieve-update-destroy",
    ),
    # stats
    path("stats/", DashboardStatsAPIView.as_view(), name="dashboard-stats"),
    path(
        "elements/",
        ListElementAchatDevisAPIView.as_view(),
        name="list-elements-achat-devis",
    ),
]
