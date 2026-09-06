import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import (
    SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD,
    FROM_EMAIL, FRONTEND_URL, OTP_EXPIRE_MINUTES,
)

def _send_email(to_email: str, subject: str, body: str):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = FROM_EMAIL
    msg["To"] = to_email
    msg.attach(MIMEText(body, "html"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.sendmail(FROM_EMAIL, to_email, msg.as_string())

def send_verification_email(to_email: str, token: str):
    verify_link = f"{FRONTEND_URL}/verify-email?token={token}"
    body = f"""
    <p>Welcome to BudgetBuddy!</p>
    <p>Please verify your email by clicking the link below:</p>
    <p><a href="{verify_link}">{verify_link}</a></p>
    <p>This link expires in 1 hour. If you didn't sign up, you can ignore this email.</p>
    """
    _send_email(to_email, "Verify your BudgetBuddy account", body)

def send_otp_email(to_email: str, otp: str):
    body = f"""
    <p>Your BudgetBuddy verification code is:</p>
    <h2 style="letter-spacing:6px;">{otp}</h2>
    <p>This code expires in {OTP_EXPIRE_MINUTES} minutes. If you didn't request this, you can ignore this email.</p>
    """
    _send_email(to_email, "Your BudgetBuddy verification code", body)

def send_password_reset_email(to_email: str, token: str):
    reset_link = f"{FRONTEND_URL}/reset-password?token={token}"
    body = f"""
    <p>We received a request to reset your BudgetBuddy password.</p>
    <p><a href="{reset_link}">{reset_link}</a></p>
    <p>This link expires in 30 minutes. If you didn't request this, you can ignore this email.</p>
    """
    _send_email(to_email, "Reset your BudgetBuddy password", body)