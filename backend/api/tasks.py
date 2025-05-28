import io
import json
import logging

from celery import shared_task
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
        print(client.email)
        action = Action.objects.get(id=action_id)

        # Déterminer le type d'action (achat ou devis)
        est_achat = action.type.upper() == "ACHAT"

        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4

        # p.drawImage("ej", 1 * cm, height - 3 * cm, width=5 * cm, height=2 * cm)

        titre = "FACTURE" if est_achat else "DEVIS"
        p.setFont("Helvetica-Bold", 18)
        p.drawString(width / 2 - 40, height - 2 * cm, f"{titre} #{action.code_action}")

        p.setFont("Helvetica", 10)
        p.drawString(1 * cm, height - 3 * cm, "EJ Logiciel")
        p.drawString(1 * cm, height - 3.5 * cm, "Antananarivo, Madagascar")
        p.drawString(1 * cm, height - 4 * cm, "Tel: +261 34 12 345 67")
        p.drawString(1 * cm, height - 4.5 * cm, "Email: romeomanoela123@gmail.com")

        p.drawString(
            width - 6 * cm,
            height - 3 * cm,
            f"Date: {localtime(action.date_action).strftime('%d-%m-%Y')}",
        )
        p.drawString(width - 6 * cm, height - 3.5 * cm, f"Réf: {action.code_action}")

        p.setFont("Helvetica-Bold", 12)
        p.drawString(1 * cm, height - 6 * cm, "INFORMATIONS CLIENT")
        p.setFont("Helvetica", 10)
        p.drawString(1 * cm, height - 6.5 * cm, f"Nom: {client.nom_complet}")
        p.drawString(1 * cm, height - 7 * cm, f"Email: {client.email}")
        p.drawString(1 * cm, height - 7.5 * cm, f"Téléphone: {client.numero_telephone}")
        p.drawString(1 * cm, height - 8 * cm, f"Adresse: {client.adresse}")

        p.setFont("Helvetica-Bold", 12)
        p.drawString(1 * cm, height - 9.5 * cm, "DÉTAILS DES PRODUITS")

        p.setFont("Helvetica-Bold", 10)
        p.drawString(1 * cm, height - 10.5 * cm, "Produit")
        p.drawString(10 * cm, height - 10.5 * cm, "Quantité")
        p.drawString(13 * cm, height - 10.5 * cm, "Prix")
        p.drawString(16 * cm, height - 10.5 * cm, "Total")

        p.setStrokeColor(colors.black)
        p.line(1 * cm, height - 11 * cm, width - 1 * cm, height - 11 * cm)

        # Contenu du tableau
        y = height - 12 * cm
        total = 0

        for produit_nom, cles in cles_data.items():
            quantite = len(cles)
            prix_unitaire = action.prix / sum(len(cles) for cles in cles_data.values())
            prix_total = prix_unitaire * quantite
            total += prix_total

            p.setFont("Helvetica", 10)
            p.drawString(1 * cm, y, produit_nom)
            p.drawString(10 * cm, y, str(quantite))
            p.drawString(13 * cm, y, f"{prix_unitaire:.2f} MGA")
            p.drawString(16 * cm, y, f"{prix_total:.2f} MGA")

            # Si c'est un achat, ajouter les clés en dessous
            if est_achat:
                p.setFont("Helvetica-Oblique", 8)
                for i, cle in enumerate(cles):
                    y -= 0.5 * cm
                    p.drawString(
                        2 * cm,
                        y,
                        f"Clé {i+1}: {cle['contenue']} (Validité: {cle['validite']})",
                    )

            y -= 1 * cm

            # Vérifier si on a besoin d'une nouvelle page
            if y < 5 * cm:
                p.showPage()
                p.setFont("Helvetica-Bold", 12)
                p.drawString(1 * cm, height - 2 * cm, "DÉTAILS DES PRODUITS (suite)")
                y = height - 3 * cm

        # Ligne de séparation avant le total
        p.line(1 * cm, y - 0.5 * cm, width - 1 * cm, y - 0.5 * cm)

        # Total
        p.setFont("Helvetica-Bold", 12)
        p.drawString(13 * cm, y - 1.5 * cm, "Total:")
        p.drawString(16 * cm, y - 1.5 * cm, f"{action.prix:.2f} MGA")

        # Conditions et notes
        y -= 3 * cm
        p.setFont("Helvetica-Bold", 10)
        p.drawString(1 * cm, y, "CONDITIONS ET NOTES:")
        p.setFont("Helvetica", 8)

        if est_achat:
            p.drawString(
                1 * cm,
                y - 0.5 * cm,
                "• Les clés d'activation sont à usage unique et ne peuvent pas être remboursées.",
            )
            p.drawString(
                1 * cm,
                y - 1 * cm,
                "• Support technique disponible à support@ejlogiciel.com",
            )
            p.drawString(1 * cm, y - 1.5 * cm, "• Merci pour votre achat!")
        else:
            p.drawString(
                1 * cm,
                y - 0.5 * cm,
                "• Ce devis est valable pour une durée de 30 jours à compter de sa date d'émission.",
            )
            p.drawString(
                1 * cm,
                y - 1 * cm,
                "• Pour accepter ce devis, veuillez nous contacter à sales@ejlogiciel.com",
            )
            p.drawString(
                1 * cm,
                y - 1.5 * cm,
                "• Conditions de paiement: 50% à la commande, 50% à la livraison.",
            )

        # Pied de page
        p.setFont("Helvetica", 8)
        p.drawString(
            width / 2 - 4 * cm, 1 * cm, "EJ Logiciel - SARL au capital de 1 000 000 MGA"
        )
        p.drawString(
            width / 2 - 3 * cm, 0.7 * cm, "NIF: 123456789 - STAT: 12345678901234"
        )

        p.showPage()
        p.save()
        buffer.seek(0)

        # Préparer le corps du message selon le type d'action
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

        # Envoyer l'email avec gestion des erreurs
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
