import io
import logging
from pathlib import Path

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

from .models import Action, Utilisateur

load_dotenv()
logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent

image_path = BASE_DIR / "static" / "ej.jpg"


@shared_task(bind=True, max_retries=3, rate_limit="10/m")
def envoyer_cles_email_async(self, client_id, action_id, cles_data):
    try:
        client = Utilisateur.objects.get(id=client_id)
        action = Action.objects.get(id=action_id)
        est_achat = action.type.upper() == "ACHAT"

        buffer = io.BytesIO()
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
                alignment=1,
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
                name="NormalCustom",
                parent=styles["Normal"],
                fontSize=10,
                spaceAfter=2 * mm,
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
                alignment=1,
                textColor=colors.darkgrey,
            )
        )

        elements = []
        titre = "FACTURE" if est_achat else "DEVIS"

        # Logo + Titre
        data = [
            [
                RLImage(
                    image_path,
                    width=4 * cm,
                    height=2 * cm,
                ),
                Paragraph(
                    f"<font size=18><b>{titre}</b></font>",
                    styles["Normal"],
                ),
            ],
            [
                Paragraph(
                    "<b>EJ Logiciel</b><br/>Antananarivo, "
                    "Madagascar<br/>Tel: +261 34 12 345 67<br/>"
                    "Email: contact@ejlogiciel.com",
                    styles["Normal"],
                ),
                Paragraph(
                    f"<b>Date:</b> {localtime(action.date_action).strftime('%d-%m-%Y')}<br/><b>Réf:</b>"
                    f" {action.code_action}",
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
        elements.append(
            HRFlowable(
                width="100%", thickness=1, color=colors.lightgrey, spaceAfter=5 * mm
            )
        )

        # Client Info
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

        # Produits
        elements.append(Paragraph("DÉTAILS DES PRODUITS", styles["SousTitre"]))
        produits_data = [
            [
                Paragraph("<b>Produit</b>", styles["Normal"]),
                Paragraph("<b>Quantité</b>", styles["Normal"]),
                Paragraph("<b>Prix unitaire</b>", styles["Normal"]),
                Paragraph("<b>Total</b>", styles["Normal"]),
            ]
        ]

        total = 0
        for produit_nom, cles in cles_data.items():
            quantite = len(cles)
            prix_unitaire = action.prix / sum(len(cles) for cles in cles_data.values())
            prix_total = prix_unitaire * quantite
            total += prix_total

            produits_data.append(
                [
                    Paragraph(produit_nom, styles["Normal"]),
                    Paragraph(str(quantite), styles["Normal"]),
                    Paragraph(f"{prix_unitaire:.2f} MGA", styles["Normal"]),
                    Paragraph(f"{prix_total:.2f} MGA", styles["Normal"]),
                ]
            )

            if est_achat:
                for i, cle in enumerate(cles):
                    produits_data.append(
                        [
                            Paragraph(
                                f"<i>Clé {i+1}: {cle['contenue'][:8]}****** (Validité: {cle['validite']})</i>",
                                styles["SmallText"],
                            ),
                            "",
                            "",
                            "",
                        ]
                    )

        produits_data.append(
            [
                "",
                "",
                Paragraph("<b>Total:</b>", styles["Normal"]),
                Paragraph(f"<b>{action.prix:.2f} MGA</b>", styles["Normal"]),
            ]
        )

        col_widths = [
            doc.width * 0.4,
            doc.width * 0.15,
            doc.width * 0.2,
            doc.width * 0.25,
        ]
        produits_table = Table(produits_data, colWidths=col_widths)

        table_style = [
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
            ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
            ("GRID", (0, 0), (-1, 0), 1, colors.black),
            ("LINEBELOW", (0, 0), (-1, 0), 1, colors.black),
            ("LINEBELOW", (0, -2), (-1, -2), 1, colors.black),
            ("LINEBELOW", (0, 1), (-1, -2), 0.5, colors.lightgrey),
            ("SPAN", (0, -1), (1, -1)),
        ]

        if est_achat:
            row_index = 1
            for produit_nom, cles in cles_data.items():
                row_index += 1
                for _ in cles:
                    table_style.append(("SPAN", (0, row_index), (-1, row_index)))
                    table_style.append(
                        ("LEFTPADDING", (0, row_index), (0, row_index), 20)
                    )
                    row_index += 1

        produits_table.setStyle(TableStyle(table_style))
        elements.append(produits_table)
        elements.append(Spacer(1, 15 * mm))

        elements.append(Paragraph("CONDITIONS ET NOTES", styles["SousTitre"]))
        conditions = (
            [
                "• Les clés d'activation sont à usage unique et ne peuvent pas être remboursées.",
                "• Support technique disponible à esoalahyjosefa@gmail.com",
                "• Merci pour votre achat!",
            ]
            if est_achat
            else [
                "• Pour accepter ce devis, veuillez nous contacter à +261 34 50 035 13",
            ]
        )

        for condition in conditions:
            elements.append(Paragraph(condition, styles["Normal"]))

        elements.append(Spacer(1, 20 * mm))
        elements.append(HRFlowable(width="100%", thickness=1, color=colors.lightgrey))
        elements.append(
            Paragraph(
                "EJ Logiciel - NIF: 123456789 - STAT: 12345678901234",
                styles["Footer"],
            )
        )

        doc.build(elements)
        buffer.seek(0)

        sujet = (
            f"Votre facture et clés d'activation"
            if est_achat
            else f"Votre devis - Réf {action.code_action}"
        )

        email_body = f"Bonjour {client.nom_complet},\n\n"

        if est_achat:
            email_body += f"Nous vous remercions pour votre achat (Commande {action.code_action}).\n\n"
            email_body += "Voici vos clés d'activation :\n\n"

            for produit_nom, cles in cles_data.items():
                email_body += f"Produit : {produit_nom}\n"
                for i, cle in enumerate(cles):
                    email_body += f"- Clé {i+1} : {cle['contenue']} (Validité : {cle['validite']})\n"
                email_body += "\n"

        else:
            email_body += (
                f"Veuillez trouver ci-joint votre devis (Réf {action.code_action}).\n\n"
            )

        email_body += "Pour toute question, n'hésitez pas à nous contacter.\n\n"
        email_body += "Cordialement,\n"
        email_body += "L'équipe EJ Logiciel"

        message = EmailMessage(
            subject=sujet,
            body=email_body,
            to=[client.email],
        )
        message.attach(
            f"{titre.lower()}_{action.code_action}.pdf",
            buffer.getvalue(),
            "application/pdf",
        )
        message.send()

    except Exception as e:
        logger.error(f"Erreur lors de l'envoi de l'email : {e}")
        self.retry(exc=e, countdown=60)
