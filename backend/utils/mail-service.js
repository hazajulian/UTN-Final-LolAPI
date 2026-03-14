// backend/src/utils/mail-service.js
import nodemailer from 'nodemailer';
import 'dotenv/config';

let transporter;

async function createTransporter() {
  const useRealSmtpInDev = process.env.MAIL_DEV_REAL === 'true';

  // PROD: siempre SMTP real
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // DEV: por defecto Ethereal, pero si MAIL_DEV_REAL=true usa SMTP real
  if (useRealSmtpInDev) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // 🧪 DEV: Ethereal (no entrega emails reales)
  const testAccount = await nodemailer.createTestAccount();
  console.log('ℹ️  Ethereal account:', testAccount.user);

  return nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
}

async function getTransporter() {
  if (!transporter) transporter = await createTransporter();
  return transporter;
}

/**
 * sendMail: envía un email.
 * - En dev con Ethereal: imprime Preview URL
 * - En dev real SMTP: te llega a tu casilla
 */
export async function sendMail({ to, subject, text, html }) {
  const tr = await getTransporter();

  const info = await tr.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@example.com',
    to,
    subject,
    text,
    html
  });

  if (process.env.NODE_ENV !== 'production' && process.env.MAIL_DEV_REAL !== 'true') {
    const url = nodemailer.getTestMessageUrl(info);
    console.log(`📨 Preview URL: ${url}`);
  }

  return info;
}
