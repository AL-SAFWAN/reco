import logging
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import emails  # type: ignore
import jwt
from jinja2 import Template
from jwt.exceptions import InvalidTokenError

from app.core.config import settings


@dataclass
class EmailData:
    html_content: str
    subject: str


def render_email_template(*, template_name: str, context: dict[str, Any]) -> str:
    template_str = (
        Path(__file__).parent.parent
        / "email-templates"
        / "template-build"
        / template_name
    ).read_text(encoding="utf-8")
    html_content = Template(template_str).render(context)
    return html_content


def send_email(
    *,
    email_to: str,
    subject: str = "",
    html_content: str = "",
) -> None:
    assert settings.emails_enabled, "no provided configuration for email variables"
    message = emails.Message(
        subject=subject,
        html=html_content,
        mail_from=(settings.EMAILS_FROM_NAME, settings.EMAILS_FROM_EMAIL),
    )

    # image_path = (
    #     Path(__file__).parent.parent / "email-templates" / "images" / "unnamed.gif"
    # )
    # with open(image_path, "rb") as f:
    #     image_data = f.read()
    # message.attach(
    #     filename="unnamed.gif",
    #     data=image_data,
    #     content_disposition="inline",
    #     content_id="legionLogo",
    #     mime_type="image/gif",
    # )

    smtp_options = {
        "host": settings.SMTP_HOST,
        "port": settings.SMTP_PORT,
        "tls": settings.SMTP_TLS,
        "ssl": settings.SMTP_SSL,
    }
    if settings.SMTP_TLS:
        smtp_options["tls"] = True
    elif settings.SMTP_SSL:
        smtp_options["ssl"] = True
    if settings.SMTP_USER:
        smtp_options["user"] = settings.SMTP_USER
    if settings.SMTP_PASSWORD:
        smtp_options["password"] = settings.SMTP_PASSWORD
    response = message.send(to=email_to, smtp=smtp_options)
    logging.info(f"send email result: {response}")


def generate_test_email(email_to: str) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - Test email"
    html_content = render_email_template(
        template_name="test_email.html",
        context={"project_name": settings.PROJECT_NAME, "email": email_to},
    )
    return EmailData(html_content=html_content, subject=subject)


def generate_reset_password_email(first_name: str, token: str) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - Password recovery for user {first_name}"
    link = f"{settings.FRONTEND_HOST}/reset-password?token={token}"
    html_content = render_email_template(
        template_name="forget_password.html",
        context={
            "firstName": first_name,
            "validMins": settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS * 60,
            "resetPasswordLink": link,
        },
    )
    return EmailData(html_content=html_content, subject=subject)


def generate_new_account_email(
    email_to: str, firstName: str, lastName: str
) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - New account for user {firstName}"
    html_content = render_email_template(
        template_name="welcome.html",
        context={
            "firstName": firstName,
            "lastName": lastName,
            "email": email_to,
            "link": settings.FRONTEND_HOST,
        },
    )
    return EmailData(html_content=html_content, subject=subject)


def generate_otp_email(otp: str) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - Verification code {otp}"
    html_content = render_email_template(
        template_name="otp.html",
        context={
            "otpCode": otp,
        },
    )
    return EmailData(html_content=html_content, subject=subject)


def generate_password_reset_token(email: str) -> str:
    delta = timedelta(hours=settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS)
    now = datetime.now(timezone.utc)
    expires = now + delta
    exp = expires.timestamp()
    encoded_jwt = jwt.encode(
        {"exp": exp, "nbf": now, "sub": email},
        settings.SECRET_KEY,
        algorithm="HS256",
    )
    return encoded_jwt


def verify_password_reset_token(token: str) -> str | None:
    try:
        decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return str(decoded_token["sub"])
    except InvalidTokenError:
        return None


def generate_job_edit_token(job_id: str) -> str:
    """Create a 72-hour signed token that lets a customer edit job fields."""
    delta = timedelta(hours=72)
    now = datetime.now(timezone.utc)
    expires = now + delta
    encoded_jwt = jwt.encode(
        {"exp": expires.timestamp(), "nbf": now, "sub": job_id, "type": "job_edit"},
        settings.SECRET_KEY,
        algorithm="HS256",
    )
    return encoded_jwt


def verify_job_edit_token(token: str) -> str | None:
    """Verify a job-edit token; returns the job_id string or None."""
    try:
        decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        if decoded.get("type") != "job_edit":
            return None
        return str(decoded["sub"])
    except InvalidTokenError:
        return None


def generate_job_edit_email(customer_name: str, token: str) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - Update your job details"
    link = f"{settings.FRONTEND_HOST}/job-update/{token}"
    html_content = render_email_template(
        template_name="job_edit_link.html",
        context={
            "customerName": customer_name,
            "editLink": link,
            "validHours": 72,
        },
    )
    return EmailData(html_content=html_content, subject=subject)
