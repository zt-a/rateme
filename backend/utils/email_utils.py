import aiosmtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from config import settings
from logging_config import logger


async def send_email(to: str, subject: str, html: str) -> None:
    message = MIMEMultipart("alternative")
    message["From"] = settings.SMTP_FROM
    message["To"] = to
    message["Subject"] = subject

    message.attach(MIMEText(html, "html"))

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            start_tls=True,
        )
        logger.info(f"Email sent to {to}")
    except Exception as e:  # noqa: F841
        logger.exception(f"Failed to send email to {to}")
        raise


# ═══════════════════════════════════════
# AUTH EMAILS
# ═══════════════════════════════════════

async def send_confirm_email(to: str, token: str) -> None:
    url = f"{settings.APP_URL}/auth/confirm-email?token={token}"

    html = build_email(
        "Подтверждение email",
        f"""
        <p>Нажмите на ссылку для подтверждения аккаунта:</p>
        <a href="{url}">{url}</a>
        <p>Ссылка действительна 24 часа.</p>
        """
    )

    await send_email(to, "Подтверждение email", html)


async def send_reset_password_email(to: str, token: str) -> None:
    url = f"{settings.APP_URL}/auth/reset-password?token={token}"

    html = build_email(
        "Сброс пароля",
        f"""
        <p>Нажмите на ссылку для сброса пароля:</p>
        <a href="{url}">{url}</a>
        <p>Ссылка действительна 1 час.</p>
        """
    )

    await send_email(to, "Сброс пароля", html)


# ═══════════════════════════════════════
# PERSON EMAILS
# ═══════════════════════════════════════

def get_contact_email_body(person_name: str, site_url: str) -> str:
    return build_email(
        "Ваш профиль добавлен",
        f"""
        <p>Здравствуйте!</p>
        <p>Профиль <strong>{person_name}</strong> был добавлен на платформу <b>RateMe</b>.</p>
        <p>Ссылка на профиль:</p>
        <p><a href="{site_url}">{site_url}</a></p>

        <p>Вы можете:</p>
        <ul>
            <li>✅ Дать согласие на публикацию</li>
            <li>❌ Отказаться — профиль будет удалён</li>
        </ul>

        <p>Ответьте на это письмо или свяжитесь с нами через сайт.</p>
        """
    )


def get_agreed_email_body(person_name: str) -> str:
    return build_email(
        "Согласие получено",
        f"""
        <p>Спасибо, <strong>{person_name}</strong>!</p>
        <p>Мы получили ваше согласие на публикацию профиля.</p>
        <p>Профиль будет опубликован после модерации.</p>
        """
    )


def get_published_email_body(person_name: str, site_url: str) -> str:
    return build_email(
        "Профиль опубликован",
        f"""
        <p><strong>{person_name}</strong>, ваш профиль опубликован 🎉</p>
        <p>Посмотреть его можно здесь:</p>
        <p><a href="{site_url}">{site_url}</a></p>
        """
    )


def get_rejected_email_body(person_name: str) -> str:
    return build_email(
        "Профиль будет удалён",
        f"""
        <p><strong>{person_name}</strong>,</p>
        <p>Мы получили отказ от публикации.</p>
        <p>Профиль будет удалён в течение 24 часов.</p>
        """
    )


# ═══════════════════════════════════════
# BASE TEMPLATE
# ═══════════════════════════════════════

def build_email(title: str, content: str) -> str:
    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>{title}</h2>
        {content}
        <br><br>
        <hr>
        <p style="color: gray;">RateMe Platform</p>
    </body>
    </html>
    """