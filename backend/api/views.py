from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import AllowAny

from backend.api.models import Utilisateur
from backend.api.serializers import UserSerializer


class UserSignUpAPIView(generics.CreateAPIView):
    queryset = Utilisateur.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
