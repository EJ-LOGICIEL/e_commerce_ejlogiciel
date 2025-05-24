import io
from celery import shared_task
from reportlab.pdfgen import canvas
from django.core.mail import EmailMessage
from django.utils.timezone import localtime
from .models import Action


@shared_task
def generer_et_envoyer_facture_async(action_id):
    try:
        action = (
            Action.objects.select_related("client")
            .prefetch_related("elements__produit")
            .get(pk=action_id)
        )
    except Action.DoesNotExist:
        return "Action introuvable"

    buffer = io.BytesIO()
    p = canvas.Canvas(buffer)

    p.setFont("Helvetica-Bold", 16)
    p.drawString(200, 800, "FACTURE")

    p.setFont("Helvetica", 12)
    p.drawString(100, 770, f"Client : {action.client.nom_complet}")
    p.drawString(100, 750, f"Email : {action.client.email}")
    p.drawString(
        100, 730, f"Date : {localtime(action.date_action).strftime('%Y-%m-%d %H:%M')}"
    )
    p.drawString(100, 710, f"Code Action : {action.code_action}")

    y = 680
    p.drawString(100, y, "Produits achetés :")
    y -= 20

    for item in action.elements.all():
        ligne = f"- {item.produit.nom} x{item.quantite} = {item.prix_total} MGA"
        p.drawString(120, y, ligne)
        y -= 20

    y -= 10
    p.setFont("Helvetica-Bold", 12)
    p.drawString(100, y, f"Total payé : {action.prix} MGA")

    p.showPage()
    p.save()

    buffer.seek(0)

    email = EmailMessage(
        subject="Votre facture",
        body="Merci pour votre achat. Vous trouverez votre facture en pièce jointe.",
        to=[action.client.email],
    )

    email.attach(f"facture.pdf", buffer.read(), "application/pdf")
    email.send()

    buffer.close()
    return f"Facture envoyée à {action.client.email}"
