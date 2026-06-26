// mail-service.js
// Gestiona el envio de emails de LoL Hub usando Brevo API.

import { buildMailHtml, escapeHtml } from "./mail-template.js";

const APP_NAME = "LoL Hub";
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

function getAppUrl() {
  return process.env.FRONTEND_URL || "http://localhost:5173";
}

function getLogoUrl() {
  return process.env.MAIL_LOGO_URL || `${getAppUrl()}/iconLoL2.PNG`;
}

function getSenderEmail() {
  if (process.env.MAIL_FROM_EMAIL) return process.env.MAIL_FROM_EMAIL;

  if (process.env.SMTP_FROM) {
    const match = process.env.SMTP_FROM.match(/<(.+?)>/);

    if (match?.[1]) return match[1];

    return process.env.SMTP_FROM;
  }

  return "no-reply@lolhub.com";
}

function getSenderName() {
  return process.env.MAIL_FROM_NAME || APP_NAME;
}

function validateBrevoEnv() {
  if (!process.env.BREVO_API_KEY) {
    throw new Error("Falta BREVO_API_KEY");
  }
}

export async function sendMail({ to, subject, text, html, replyTo }) {
  validateBrevoEnv();

  const payload = {
    sender: {
      name: getSenderName(),
      email: getSenderEmail(),
    },
    to: [{ email: to }],
    subject,
    textContent: text,
    htmlContent: html,
  };

  if (replyTo) {
    payload.replyTo = { email: replyTo };
  }

  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("MAIL_ERROR: Brevo rechazo el envio", {
      status: response.status,
      data,
    });

    throw new Error(data?.message || "No se pudo enviar el email con Brevo");
  }

  console.log("MAIL_DEBUG: email enviado correctamente con Brevo", {
    to,
    subject,
    messageId: data?.messageId,
  });

  return data;
}

export async function sendWelcomeMail({ to, username }) {
  const safeUsername = escapeHtml(username);

  return sendMail({
    to,
    subject: "Bienvenido a LoL Hub",
    text: `Hola ${username}, tu cuenta en LoL Hub fue creada correctamente.`,
    html: buildMailHtml({
      variant: "welcome",
      logoUrl: getLogoUrl(),
      title: "Bienvenido a LoL Hub",
      preview: "Tu cuenta fue creada correctamente.",
      content: `
        <p>Hola <strong>${safeUsername}</strong>,</p>
        <p>Tu cuenta en <strong>LoL Hub</strong> fue creada correctamente.</p>
        <p>Ya podes guardar campeones favoritos, explorar regiones, consultar items, revisar runas y ver hechizos de invocador.</p>
      `,
      buttonText: "Entrar a LoL Hub",
      buttonUrl: getAppUrl(),
    }),
  });
}

export async function sendResetPasswordMail({ to, username, resetUrl }) {
  const safeUsername = escapeHtml(username);

  return sendMail({
    to,
    subject: "Recuperar contraseña - LoL Hub",
    text: `Hola ${username}, podes recuperar tu contraseña desde este enlace: ${resetUrl}`,
    html: buildMailHtml({
      variant: "reset",
      logoUrl: getLogoUrl(),
      title: "Recuperar contraseña",
      preview: "Recibimos una solicitud para restablecer tu contraseña.",
      content: `
        <p>Hola <strong>${safeUsername}</strong>,</p>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>LoL Hub</strong>.</p>
        <p>Si fuiste vos, usa el boton para crear una nueva contraseña.</p>
        <p style="color:#6f6657;font-size:14px;">Si no solicitaste este cambio, podes ignorar este mensaje.</p>
      `,
      buttonText: "Restablecer contraseña",
      buttonUrl: resetUrl,
    }),
  });
}

export async function sendPasswordChangedMail({ to, username }) {
  const safeUsername = escapeHtml(username);

  return sendMail({
    to,
    subject: "Contraseña actualizada - LoL Hub",
    text: `Hola ${username}, tu contraseña de LoL Hub fue actualizada correctamente.`,
    html: buildMailHtml({
      variant: "password",
      logoUrl: getLogoUrl(),
      title: "Contraseña actualizada",
      preview: "Tu contraseña fue cambiada correctamente.",
      content: `
        <p>Hola <strong>${safeUsername}</strong>,</p>
        <p>Te avisamos que la contraseña de tu cuenta en <strong>LoL Hub</strong> fue actualizada correctamente.</p>
        <p style="color:#6f6657;font-size:14px;">Si no hiciste este cambio, intenta recuperar tu cuenta cuanto antes.</p>
      `,
      buttonText: "Ir a LoL Hub",
      buttonUrl: getAppUrl(),
    }),
  });
}

export async function sendAccountDeletedMail({ to, username }) {
  const safeUsername = escapeHtml(username);

  return sendMail({
    to,
    subject: "Cuenta eliminada - LoL Hub",
    text: `Hola ${username}, tu cuenta de LoL Hub fue eliminada correctamente.`,
    html: buildMailHtml({
      variant: "danger",
      logoUrl: getLogoUrl(),
      title: "Cuenta eliminada",
      preview: "Tu cuenta fue eliminada correctamente.",
      content: `
        <p>Hola <strong>${safeUsername}</strong>,</p>
        <p>Te confirmamos que tu cuenta de <strong>LoL Hub</strong> fue eliminada correctamente.</p>
        <p>Ya no vas a poder acceder a tu perfil, favoritos o informacion asociada a esa cuenta.</p>
      `,
      buttonText: "Volver a LoL Hub",
      buttonUrl: getAppUrl(),
    }),
  });
}