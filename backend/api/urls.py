from django.urls import path

from .views import (
    ClientSignUpAPIView,
    CustomTokenObtainPairView,
    CustomTokenRefreshView,
)

urlpatterns = [
    path("signup/", ClientSignUpAPIView.as_view(), name="signup"),
    path("login/", CustomTokenObtainPairView.as_view(), name="login"),
    path("refresh/", CustomTokenRefreshView.as_view(), name="refresh"),
]
