import io
import json
import logging
from datetime import datetime

from celery import shared_task
from django.core.mail import EmailMessage
from django.utils.timezone import localtime
from dotenv import load_dotenv
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.platypus import Paragraph, Spacer, Table, TableStyle, Image as RLImage
from reportlab.platypus.doctemplate import SimpleDocTemplate
from reportlab.platypus.flowables import HRFlowable

load_dotenv()

from .models import Action, Utilisateur, EmailEchec

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, rate_limit="10/m")
def envoyer_cles_email_async(self, client_id, action_id, cles_data):
    try:
        client = Utilisateur.objects.get(id=client_id)
        action = Action.objects.get(id=action_id)

        est_achat = action.type.upper() == "ACHAT"

        # Création du PDF avec une meilleure mise en page
        buffer = io.BytesIO()

        # Utiliser SimpleDocTemplate pour une mise en page plus professionnelle
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=20 * mm,
            leftMargin=20 * mm,
            topMargin=20 * mm,
            bottomMargin=20 * mm,
        )

        # Styles
        styles = getSampleStyleSheet()
        styles.add(
            ParagraphStyle(
                name="TitrePrincipal",
                parent=styles["Heading1"],
                fontSize=18,
                alignment=1,  # Centré
                spaceAfter=10 * mm,
            )
        )
        styles.add(
            ParagraphStyle(
                name="SousTitre",
                parent=styles["Heading2"],
                fontSize=14,
                textColor=colors.navy,
                spaceAfter=5 * mm,
            )
        )
        styles.add(
            ParagraphStyle(
                name="Normal", parent=styles["Normal"], fontSize=10, spaceAfter=2 * mm
            )
        )
        styles.add(
            ParagraphStyle(
                name="SmallText",
                parent=styles["Normal"],
                fontSize=8,
                textColor=colors.grey,
            )
        )
        styles.add(
            ParagraphStyle(
                name="Footer",
                parent=styles["Normal"],
                fontSize=8,
                alignment=1,  # Centré
                textColor=colors.darkgrey,
            )
        )

        # Contenu du document
        elements = []

        # En-tête avec logo et titre
        titre = "FACTURE" if est_achat else "DEVIS"

        # Logo et informations de l'entreprise
        data = [
            [
                # Essayer de charger le logo, sinon utiliser un espace vide
                RLImage("backend/static/ej.jpg", width=4 * cm, height=2 * cm),
                Paragraph(
                    f"<font size=18><b>{titre} #{action.code_action}</b></font>",
                    styles["Normal"],
                ),
            ],
            [
                Paragraph(
                    "<b>EJ Logiciel</b><br/>Antananarivo, Madagascar<br/>Tel: +261 34 12 345 67<br/>Email: contact@ejlogiciel.com",
                    styles["Normal"],
                ),
                Paragraph(
                    f"<b>Date:</b> {localtime(action.date_action).strftime('%d-%m-%Y')}<br/><b>Réf:</b> {action.code_action}",
                    styles["Normal"],
                ),
            ],
        ]

        header_table = Table(data, colWidths=[doc.width / 2.0] * 2)
        header_table.setStyle(
            TableStyle(
                [
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("ALIGN", (1, 0), (1, 0), "RIGHT"),
                    ("ALIGN", (1, 1), (1, 1), "RIGHT"),
                ]
            )
        )
        elements.append(header_table)
        elements.append(Spacer(1, 10 * mm))

        # Ligne de séparation
        elements.append(
            HRFlowable(
                width="100%", thickness=1, color=colors.lightgrey, spaceAfter=5 * mm
            )
        )

        # Informations client
        elements.append(Paragraph("INFORMATIONS CLIENT", styles["SousTitre"]))
        client_data = [
            [
                Paragraph("<b>Nom:</b>", styles["Normal"]),
                Paragraph(client.nom_complet, styles["Normal"]),
            ],
            [
                Paragraph("<b>Email:</b>", styles["Normal"]),
                Paragraph(client.email, styles["Normal"]),
            ],
            [
                Paragraph("<b>Téléphone:</b>", styles["Normal"]),
                Paragraph(client.numero_telephone, styles["Normal"]),
            ],
            [
                Paragraph("<b>Adresse:</b>", styles["Normal"]),
                Paragraph(client.adresse, styles["Normal"]),
            ],
        ]
        client_table = Table(
            client_data, colWidths=[doc.width / 5.0, doc.width * 4 / 5.0]
        )
        client_table.setStyle(
            TableStyle(
                [
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("BACKGROUND", (0, 0), (0, -1), colors.lightgrey),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ]
            )
        )
        elements.append(client_table)
        elements.append(Spacer(1, 10 * mm))

        # Détails des produits
        elements.append(Paragraph("DÉTAILS DES PRODUITS", styles["SousTitre"]))

        # En-tête du tableau des produits
        produits_data = [
            [
                Paragraph("<b>Produit</b>", styles["Normal"]),
                Paragraph("<b>Quantité</b>", styles["Normal"]),
                Paragraph("<b>Prix unitaire</b>", styles["Normal"]),
                Paragraph("<b>Total</b>", styles["Normal"]),
            ]
        ]

        total = 0

        # Lignes du tableau des produits
        for produit_nom, cles in cles_data.items():
            quantite = len(cles)
            prix_unitaire = action.prix / sum(len(cles) for cles in cles_data.values())
            prix_total = prix_unitaire * quantite
            total += prix_total

            produit_row = [
                Paragraph(produit_nom, styles["Normal"]),
                Paragraph(str(quantite), styles["Normal"]),
                Paragraph(f"{prix_unitaire:.2f} MGA", styles["Normal"]),
                Paragraph(f"{prix_total:.2f} MGA", styles["Normal"]),
            ]
            produits_data.append(produit_row)

            # Ajouter les clés pour les achats
            if est_achat:
                for i, cle in enumerate(cles):
                    cle_row = [
                        Paragraph(
                            f"<i>Clé {i+1}: {cle['contenue']} (Validité: {cle['validite']})</i>",
                            styles["SmallText"],
                        ),
                        "",
                        "",
                        "",
                    ]
                    produits_data.append(cle_row)

        # Ligne du total
        produits_data.append(
            [
                "",
                "",
                Paragraph("<b>Total:</b>", styles["Normal"]),
                Paragraph(f"<b>{action.prix:.2f} MGA</b>", styles["Normal"]),
            ]
        )

        # Création du tableau des produits
        col_widths = [
            doc.width * 0.4,
            doc.width * 0.15,
            doc.width * 0.2,
            doc.width * 0.25,
        ]
        produits_table = Table(produits_data, colWidths=col_widths)

        # Style du tableau des produits
        table_style = [
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
            ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
            ("GRID", (0, 0), (-1, 0), 1, colors.black),
            ("LINEBELOW", (0, 0), (-1, 0), 1, colors.black),
            ("LINEBELOW", (0, -2), (-1, -2), 1, colors.black),
            ("LINEBELOW", (0, 1), (-1, -2), 0.5, colors.lightgrey),
            ("SPAN", (0, -1), (1, -1)),  # Fusionner les cellules pour le total
        ]

        # Ajouter des styles spécifiques pour les lignes de clés
        if est_achat:
            row_index = 1
            for produit_nom, cles in cles_data.items():
                row_index += 1  # Ligne du produit
                for i in range(len(cles)):
                    table_style.append(
                        ("SPAN", (0, row_index), (-1, row_index))
                    )  # Fusionner toute la ligne pour la clé
                    table_style.append(
                        ("LEFTPADDING", (0, row_index), (0, row_index), 20)
                    )  # Indentation
                    row_index += 1

        produits_table.setStyle(TableStyle(table_style))
        elements.append(produits_table)
        elements.append(Spacer(1, 15 * mm))

        # Conditions et notes
        elements.append(Paragraph("CONDITIONS ET NOTES", styles["SousTitre"]))

        if est_achat:
            conditions = [
                "• Les clés d'activation sont à usage unique et ne peuvent pas être remboursées.",
                "• Support technique disponible à support@ejlogiciel.com",
                "• Merci pour votre achat!",
            ]
        else:
            conditions = [
                "• Ce devis est valable pour une durée de 30 jours à compter de sa date d'émission.",
                "• Pour accepter ce devis, veuillez nous contacter à sales@ejlogiciel.com",
                "• Conditions de paiement: 50% à la commande, 50% à la livraison.",
            ]

        for condition in conditions:
            elements.append(Paragraph(condition, styles["Normal"]))

        # Pied de page
        elements.append(Spacer(1, 20 * mm))
        elements.append(HRFlowable(width="100%", thickness=1, color=colors.lightgrey))
        elements.append(
            Paragraph(
                "EJ Logiciel - SARL au capital de 1 000 000 MGA<br/>NIF: 123456789 - STAT: 12345678901234",
                styles["Footer"],
            )
        )

        # Générer le PDF
        doc.build(elements)
        buffer.seek(0)

        # Préparer l'email
        if est_achat:
            sujet = (
                f"Votre facture et clés d'activation - Commande #{action.code_action}"
            )
            corps_message = f"""
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background-color: #061e53; color: white; padding: 10px 20px; text-align: center; border-radius: 5px 5px 0 0; }}
                    .content {{ background-color: #f9f9f9; padding: 20px; border-left: 1px solid #ddd; border-right: 1px solid #ddd; }}
                    .footer {{ background-color: #f1f1f1; padding: 10px 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 5px 5px; border: 1px solid #ddd; }}
                    .button {{ display: inline-block; background-color: #061e53; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px; }}
                    .highlight {{ color: #061e53; font-weight: bold; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>Confirmation de votre commande</h2>
                    </div>
                    <div class="content">
                        <p>Bonjour <span class="highlight">{client.nom_complet}</span>,</p>
                        
                        <p>Nous vous remercions pour votre achat (Commande <span class="highlight">#{action.code_action}</span>).</p>
                        
                        <p>Veuillez trouver ci-joint votre facture contenant les clés d'activation pour les produits achetés.</p>
                        
                        <p>Récapitulatif de votre commande :</p>
                        <ul>
            """

            # Ajouter les détails des produits
            for produit_nom, cles in cles_data.items():
                corps_message += (
                    f"<li><strong>{produit_nom}</strong> - Quantité: {len(cles)}</li>"
                )

            corps_message += f"""
                        </ul>
                        
                        <p>Montant total: <span class="highlight">{action.prix:.2f} MGA</span></p>
                        
                        <p>En cas de problème avec vos clés, n'hésitez pas à contacter notre service client.</p>
                        
                        <a href="mailto:support@ejlogiciel.com" class="button">Contacter le support</a>
                    </div>
                    <div class="footer">
                        <p>Cordialement,<br>L'équipe EJ Logiciel</p>
                        <p>© {datetime.now().year} EJ Logiciel - Tous droits réservés</p>
                    </div>
                </div>
            </body>
            </html>
            """
            nom_fichier = f"facture_{action.code_action}.pdf"
        else:
            sujet = f"Votre devis - Référence #{action.code_action}"
            corps_message = f"""
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background-color: #061e53; color: white; padding: 10px 20px; text-align: center; border-radius: 5px 5px 0 0; }}
                    .content {{ background-color: #f9f9f9; padding: 20px; border-left: 1px solid #ddd; border-right: 1px solid #ddd; }}
                    .footer {{ background-color: #f1f1f1; padding: 10px 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 5px 5px; border: 1px solid #ddd; }}
                    .button {{ display: inline-block; background-color: #061e53; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px; }}
                    .highlight {{ color: #061e53; font-weight: bold; }}
                    .note {{ background-color: #e7f3ff; padding: 10px; border-left: 4px solid #061e53; margin: 15px 0; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>Votre devis est prêt</h2>
                    </div>
                    <div class="content">
                        <p>Bonjour <span class="highlight">{client.nom_complet}</span>,</p>
                        
                        <p>Suite à votre demande, veuillez trouver ci-joint votre devis (Réf: <span class="highlight">#{action.code_action}</span>).</p>
                        
                        <p>Récapitulatif de votre devis :</p>
                        <ul>
            """

            # Ajouter les détails des produits
            for produit_nom, cles in cles_data.items():
                corps_message += (
                    f"<li><strong>{produit_nom}</strong> - Quantité: {len(cles)}</li>"
                )

            corps_message += f"""
                        </ul>
                        
                        <p>Montant total: <span class="highlight">{action.prix:.2f} MGA</span></p>
                        
                        <div class="note">
                            <p>Ce devis est valable pour une durée de 30 jours à compter de sa date d'émission.</p>
                        </div>
                        
                        <p>Pour toute question ou pour valider ce devis, n'hésitez pas à nous contacter.</p>
                        
                        <a href="mailto:sales@ejlogiciel.com" class="button">Valider ce devis</a>
                    </div>
                    <div class="footer">
                        <p>Cordialement,<br>L'équipe EJ Logiciel</p>
                        <p>© {datetime.now().year} EJ Logiciel - Tous droits réservés</p>
                    </div>
                </div>
            </body>
            </html>
            """
            nom_fichier = f"devis_{action.code_action}.pdf"

        try:
            email = EmailMessage(
                subject=sujet,
                body=corps_message,
                to=[client.email],
            )
            email.content_subtype = "html"  # Pour envoyer un email HTML
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
        countdown = 60 * (2**self.request.retries)
        raise self.retry(exc=e, countdown=countdown)
