from django.contrib import admin

from .models import *

admin.site.register(Utilisateur)
admin.site.register(Categorie)
admin.site.register(Produit)
admin.site.register(Cle)
admin.site.register(MethodePaiement)
admin.site.register(Action)
admin.site.register(ElementAchatDevis)
admin.site.register(EmailEchec)
