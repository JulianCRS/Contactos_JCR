import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from typing import List
import os

class EmailSender:
    def __init__(self):
        self.email = "BUSINESS.CONTACT.JCRContact@gmail.com"
        self.password = "gzyn cxqt aqck amvz"
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587

    async def send_email(
        self,
        recipients: List[str],
        subject: str,
        message: str,
        attachments: List[str] = None
    ):
        msg = MIMEMultipart()
        msg['From'] = self.email
        msg['To'] = ', '.join(recipients)
        msg['Subject'] = subject

        # Añadir el cuerpo del mensaje
        msg.attach(MIMEText(message, 'plain'))

        # Añadir archivos adjuntos si existen
        if attachments:
            for file_path in attachments:
                with open(file_path, 'rb') as f:
                    part = MIMEApplication(f.read(), Name=os.path.basename(file_path))
                    part['Content-Disposition'] = f'attachment; filename="{os.path.basename(file_path)}"'
                    msg.attach(part)

        # Enviar el email
        try:
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.email, self.password)
                server.send_message(msg)
            return True
        except Exception as e:
            raise Exception(f"Error al enviar el email: {str(e)}")