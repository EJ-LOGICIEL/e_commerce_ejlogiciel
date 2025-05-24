from django.urls import path

from .views import (
    ClientSignUpAPIView,
    CustomTokenObtainPairView,
    CustomTokenRefreshView,
    LogoutView,
    ListProductsAPIView,
    ProductDetailAPIView,
    CreateProductAPIView,
)

urlpatterns = [
    # Authentication
    path("signup/", ClientSignUpAPIView.as_view(), name="signup"),
    path("token/", CustomTokenObtainPairView.as_view(), name="login"),
    path("refresh/", CustomTokenRefreshView.as_view(), name="refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    # Products
    path("products/", ListProductsAPIView.as_view(), name="product-list"),
    path("products/create/", CreateProductAPIView.as_view(), name="product-create"),
    path("products/<int:pk>/", ProductDetailAPIView.as_view(), name="product-detail"),
]
