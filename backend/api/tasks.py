import io
import json
import logging
import os

from celery import shared_task
from django.conf import settings
from django.core.mail import EmailMessage
from django.utils.timezone import localtime
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas

from .models import Action, Utilisateur, EmailEchec

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, rate_limit="10/m")
def envoyer_cles_email_async(self, client_id, action_id, cles_data):
    try:
        client = Utilisateur.objects.get(id=client_id)
        action = Action.objects.get(id=action_id)

        # Déterminer le type d'action (achat ou devis)
        est_achat = action.type.upper() == "ACHAT"

        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4

        marge_gauche = 1 * cm
        marge_droite = width - (1 * cm)
        position_y = height - 1 * cm

        image_path = os.path.join(settings.BASE_DIR, "static", "ej.jpg")
        if os.path.exists(image_path):
            p.drawImage(
                image_path,
                marge_gauche,
                height - 3 * cm,
                width=5 * cm,
                height=2.5 * cm,
            )
        else:
            p.setFont("Helvetica-Bold", 24)
            p.drawString(marge_gauche, height - 2.5 * cm, "EJ Logiciel")

        titre = "FACTURE" if est_achat else "DEVIS"
        p.setFont("Helvetica-Bold", 18)
        titre_texte = f"{titre} #{action.code_action}"
        titre_width = p.stringWidth(titre_texte, "Helvetica-Bold", 18)
        p.drawString((width - titre_width) / 2, position_y, titre_texte)
        position_y -= 3 * cm

        # Informations de l'entreprise (alignées à gauche)
        p.setFont("Helvetica", 10)
        p.drawString(marge_gauche, position_y, "EJ Logiciel")
        position_y -= 0.5 * cm
        p.drawString(marge_gauche, position_y, "Antananarivo, Madagascar")
        position_y -= 0.5 * cm
        p.drawString(marge_gauche, position_y, "Tel: +261 34 12 345 67")
        position_y -= 0.5 * cm
        p.drawString(
            marge_gauche,
            position_y,
            f"Email: {os.getenv('EMAIL_HOST_USER')}",
        )
        position_y -= 0.5 * cm
        p.drawString(marge_gauche, position_y, "Web: www.ejlogiciel.com")
        position_y -= 1 * cm

        date_text = f"Date: {localtime(action.date_action).strftime('%d-%m-%Y')}"
        ref_text = f"Réf: {action.code_action}"
        date_width = p.stringWidth(date_text, "Helvetica", 10)
        ref_width = p.stringWidth(ref_text, "Helvetica", 10)

        p.drawString(marge_droite - date_width, height - 3 * cm, date_text)
        p.drawString(marge_droite - ref_width, height - 3.5 * cm, ref_text)

        p.setFont("Helvetica-Bold", 12)
        p.drawString(marge_gauche, position_y, "INFORMATIONS CLIENT")
        position_y -= 0.7 * cm

        p.setFont("Helvetica", 10)
        p.drawString(marge_gauche, position_y, f"Nom: {client.nom_complet}")
        position_y -= 0.5 * cm
        p.drawString(marge_gauche, position_y, f"Email: {client.email}")
        position_y -= 0.5 * cm
        p.drawString(marge_gauche, position_y, f"Téléphone: {client.numero_telephone}")
        position_y -= 0.5 * cm
        p.drawString(marge_gauche, position_y, f"Adresse: {client.adresse}")
        position_y -= 1 * cm

        p.setFont("Helvetica-Bold", 12)
        p.drawString(marge_gauche, position_y, "DÉTAILS DES PRODUITS")
        position_y -= 1 * cm

        col1 = marge_gauche
        col2 = width * 0.55  # 55% de la largeur
        col3 = width * 0.7  # 70% de la largeur
        col4 = width * 0.85  # 85% de la largeur

        p.setFont("Helvetica-Bold", 10)
        p.drawString(col1, position_y, "Produit")
        p.drawString(col2, position_y, "Quantité")
        p.drawString(col3, position_y, "Prix")
        p.drawString(col4, position_y, "Total")
        position_y -= 0.5 * cm

        p.setStrokeColor(colors.black)
        p.line(marge_gauche, position_y, marge_droite, position_y)
        position_y -= 0.7 * cm

        total = 0

        for produit_nom, cles in cles_data.items():
            quantite = len(cles)
            prix_unitaire = action.prix / sum(len(cles) for cles in cles_data.values())
            prix_total = prix_unitaire * quantite
            total += prix_total

            p.setFont("Helvetica", 10)
            produit_nom_affiche = produit_nom
            if len(produit_nom) > 40:
                produit_nom_affiche = produit_nom[:37] + "..."

            p.drawString(col1, position_y, produit_nom_affiche)
            p.drawRightString(col2 + 1 * cm, position_y, str(quantite))
            p.drawRightString(col3 + 1 * cm, position_y, f"{prix_unitaire:.2f} MGA")
            p.drawRightString(col4 + 1 * cm, position_y, f"{prix_total:.2f} MGA")

            if est_achat:
                p.setFont("Helvetica", 8)
                for i, cle in enumerate(cles):
                    position_y -= 0.4 * cm
                    cle_text = (
                        f"Clé {i+1}: {cle['contenue']} (Validité: {cle['validite']})"
                    )
                    if len(cle_text) > 80:
                        cle_text = cle_text[:77] + "..."
                    p.drawString(col1 + 0.5 * cm, position_y, cle_text)

            position_y -= 0.8 * cm

            if position_y < 5 * cm:
                p.showPage()
                position_y = height - 3 * cm
                p.setFont("Helvetica-Bold", 12)
                p.drawString(marge_gauche, position_y, "DÉTAILS DES PRODUITS (suite)")
                position_y -= 1 * cm

                p.setFont("Helvetica-Bold", 10)
                p.drawString(col1, position_y, "Produit")
                p.drawString(col2, position_y, "Quantité")
                p.drawString(col3, position_y, "Prix")
                p.drawString(col4, position_y, "Total")
                position_y -= 0.5 * cm

                p.line(marge_gauche, position_y, marge_droite, position_y)
                position_y -= 0.7 * cm

        p.line(marge_gauche, position_y, marge_droite, position_y)
        position_y -= 1 * cm

        p.setFont("Helvetica-Bold", 12)
        total_label = "Total:"
        total_value = f"{action.prix:.2f} MGA"
        p.drawRightString(col3 + 1 * cm, position_y, total_label)
        p.drawRightString(col4 + 1 * cm, position_y, total_value)
        position_y -= 2 * cm

        # Conditions et notes
        p.setFont("Helvetica-Bold", 10)
        p.drawString(marge_gauche, position_y, "CONDITIONS ET NOTES:")
        position_y -= 0.5 * cm
        p.setFont("Helvetica", 8)

        if est_achat:
            p.drawString(
                marge_gauche,
                position_y,
                "• Les clés d'activation sont à usage unique et ne peuvent pas être remboursées.",
            )
            position_y -= 0.5 * cm
            p.drawString(
                marge_gauche,
                position_y,
                f"• Support technique disponible à {os.getenv('EMAIL_HOST_USER')}",
            )
            position_y -= 0.5 * cm
            p.drawString(marge_gauche, position_y, "• Merci pour votre achat!")
        else:
            p.drawString(
                marge_gauche,
                position_y,
                "• Ce devis est valable pour une durée de 30 jours à compter de sa date d'émission.",
            )
            position_y -= 0.5 * cm
            p.drawString(
                marge_gauche,
                position_y,
                f"• Pour accepter ce devis, veuillez nous contacter à {os.getenv('EMAIL_HOST_USER')}",
            )
            position_y -= 0.5 * cm

        p.setFont("Helvetica", 8)
        p.drawCentredString(width / 2, 1 * cm, "EJ Logiciel - Tous droits réservés")

        p.showPage()
        p.save()
        buffer.seek(0)

        if est_achat:
            sujet = (
                f"Votre facture et clés d'activation - Commande #{action.code_action}"
            )
            corps_message = f"""
            Bonjour {client.nom_complet},

            Nous vous remercions pour votre achat (Commande #{action.code_action}).

            Veuillez trouver ci-joint votre facture contenant les clés d'activation pour les produits achetés.

            En cas de problème avec vos clés, n'hésitez pas à contacter notre service client.

            Cordialement,
            L'équipe EJ Logiciel
            """
            nom_fichier = f"facture_{action.code_action}.pdf"
        else:
            sujet = f"Votre devis - Référence #{action.code_action}"
            corps_message = f"""
            Bonjour {client.nom_complet},

            Suite à votre demande, veuillez trouver ci-joint votre devis (Réf: #{action.code_action}).

            Ce devis est valable pour une durée de 30 jours à compter de sa date d'émission.

            Pour toute question ou pour valider ce devis, n'hésitez pas à nous contacter.

            Cordialement,
            L'équipe EJ Logiciel
            """
            nom_fichier = f"devis_{action.code_action}.pdf"

        try:
            email = EmailMessage(
                subject=sujet,
                body=corps_message,
                to=[client.email],
            )
            email.attach(nom_fichier, buffer.read(), "application/pdf")
            email.send(fail_silently=False)

            logger.info(
                f"Email {'avec clés' if est_achat else 'de devis'} envoyé à {client.email} "
                f"pour l'action {action.code_action}"
            )
            return f"Email {'avec clés' if est_achat else 'de devis'} envoyé à {client.email}"
        except Exception as email_error:
            logger.error(f"Erreur lors de l'envoi de l'email: {str(email_error)}")
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
