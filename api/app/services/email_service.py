
"""
Email service abstraction.
Right now it just logs to console.
To add a real provider later, replace the send() function body:

SendGrid:
    pip install sendgrid
    from sendgrid import SendGridAPIClient
    from sendgrid.helpers.mail import Mail
    sg = SendGridAPIClient(os.environ["SENDGRID_API_KEY"])
    msg = Mail(from_email="noreply@promptify.app", to_emails=to,
               subject=subject, html_content=body_html)
    sg.send(msg)

Resend:
    pip install resend
    import resend
    resend.api_key = os.environ["RESEND_API_KEY"]
    resend.Emails.send({"from": "noreply@promptify.app",
                        "to": to, "subject": subject, "html": body_html})
"""

import logging

logger = logging.getLogger(__name__)


async def send_email(to: str, subject: str, body_html: str) -> bool:
    """
    Send an email. Returns True on success, False on failure.
    Replace this body with a real provider when ready.
    """
    logger.info(f"[EMAIL] To: {to} | Subject: {subject}")
    logger.info(f"[EMAIL] Body preview: {body_html[:200]}")
    # TODO: replace with real email provider
    return True


def build_invite_email(workspace_name: str, inviter_email: str, invite_url: str) -> tuple[str, str]:
    """Returns (subject, html_body) for a workspace invite email."""
    subject = f"You've been invited to join {workspace_name} on Promptify"
    body = f"""
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
      <img src="https://promptpilot-lac.vercel.app/prompt_logo.jpg"
           width="40" height="40"
           style="border-radius: 50%; margin-bottom: 24px;" />

      <h2 style="color: #0f172a; margin-bottom: 8px;">
        You&apos;re invited to join <strong>{workspace_name}</strong>
      </h2>

      <p style="color: #475569; line-height: 1.6;">
        <strong>{inviter_email}</strong> has invited you to collaborate
        on <strong>{workspace_name}</strong> in Promptify — the AI prompt
        engineering platform.
      </p>

      <a href="{invite_url}"
         style="display: inline-block; margin-top: 24px; padding: 12px 24px;
                background: #6C3AFF; color: white; border-radius: 10px;
                text-decoration: none; font-weight: 600; font-size: 14px;">
        Accept invitation
      </a>

      <p style="color: #94a3b8; font-size: 12px; margin-top: 32px;">
        This link expires in 7 days. If you weren&apos;t expecting this invite,
        you can ignore this email.
      </p>
    </div>
    """
    return subject, body