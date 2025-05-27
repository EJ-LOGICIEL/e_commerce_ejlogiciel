import io
import json
import logging

from celery import shared_task
from django.core.mail import EmailMessage
from django.utils.timezone import localtime
from reportlab.pdfgen import canvas

from .models import Action, Utilisateur, EmailEchec

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, rate_limit="10/m")
def envoyer_cles_email_async(self, client_id, action_id, cles_data):
    """
    Envoie un email contenant les clés d'activation au client.
    """
    try:
        client = Utilisateur.objects.get(id=client_id)
        action = Action.objects.get(id=action_id)

        # Générer la facture PDF
        buffer = io.BytesIO()
        p = canvas.Canvas(buffer)

        # En-tête
        p.setFont("Helvetica-Bold", 16)
        p.drawString(200, 800, f"FACTURE #{action.code_action}")

        # Informations client
        p.setFont("Helvetica", 12)
        p.drawString(100, 770, f"Client : {client.nom_complet}")
        p.drawString(100, 750, f"Email : {client.email}")
        p.drawString(
            100,
            730,
            f"Date : {localtime(action.date_action).strftime('%d-%m-%Y %H:%M')}",
        )
        p.drawString(100, 710, f"Code : {action.code_action}")

        # Produits achetés
        y = 680
        p.drawString(100, y, "Produits achetés :")
        y -= 20

        for produit_nom, cles in cles_data.items():
            p.drawString(120, y, f"- {produit_nom} x{len(cles)}")
            y -= 20

        # Total
        y -= 10
        p.setFont("Helvetica-Bold", 12)
        p.drawString(100, y, f"Total payé : {action.prix} MGA")

        p.showPage()
        p.save()
        buffer.seek(0)

        corps_message = f"""
        Bonjour {client.nom_complet},

        Merci pour votre commande #{action.code_action}.

        Veuillez trouver ci-joint votre facture et les clés d'activation.

        Cordialement,
        L'équipe EJ Logiciel
        """

        # Envoyer l'email avec gestion des erreurs
        try:
            email = EmailMessage(
                subject=f"Vos clés - Commande #{action.code_action}",
                body=corps_message,
                to=[client.email],
            )
            email.attach(
                f"facture_{action.code_action}.pdf", buffer.read(), "application/pdf"
            )
            email.send(fail_silently=False)

            logger.info(
                f"Email avec clés envoyé à {client.email} pour l'action {action.code_action}"
            )
            return f"Email avec clés envoyé à {client.email}"
        except Exception as email_error:
            logger.error(f"Erreur lors de l'envoi de l'email: {str(email_error)}")
            # Enregistrer l'échec dans la base de données pour suivi
            EmailEchec.objects.create(
                client=client,
                action=action,
                erreur=str(email_error),
                donnees=json.dumps(cles_data),
            )
            raise
        finally:
            buffer.close()

    except (Utilisateur.DoesNotExist, Action.DoesNotExist) as e:
        logger.error(f"Entité introuvable: {str(e)}")
        return f"Erreur: {str(e)}"

    except Exception as e:
        logger.error(f"Erreur lors de l'envoi de l'email: {str(e)}")
        countdown = 60 * (2**self.request.retries)  # 1min, 2min, 4min, etc.
        raise self.retry(exc=e, countdown=countdown)
