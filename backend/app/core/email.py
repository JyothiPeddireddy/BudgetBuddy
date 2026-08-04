import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import (
    SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD,
    FROM_EMAIL, FRONTEND_URL,
)

def send_verification_email(to_email: str, token: str):
    verify_link = f"{FRONTEND_URL}/verify-email?token={token}"

    subject = "Verify your BudgetBuddy account"
    body = f"""
    <p>Welcome to BudgetBuddy!</p>
    <p>Please verify your email by clicking the link below:</p>
    <p><a href="{verify_link}">{verify_link}</a></p>
    <p>This link expires in 1 hour. If you didn't sign up, you can ignore this email.</p>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = FROM_EMAIL
    msg["To"] = to_email
    msg.attach(MIMEText(body, "html"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.sendmail(FROM_EMAIL, to_email, msg.as_string())