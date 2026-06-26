// contact-controller.js
// Procesa y envia mensajes desde el formulario de contacto.

import { sendMail } from "../utils/mail-service.js";

import { info, error } from "../utils/logger.js";

// Envia un mensaje de contacto al correo configurado.
export async function contactController(req, res) {
  const { subject, message } = req.body;
  const user = req.user;

  const to = process.env.CONTACT_RECEIVER;

  if (!to) {
    return res.status(500).json({
      message: "CONTACT_RECEIVER is not configured",
    });
  }

  try {
    await sendMail({
      to,
      subject: `[Contact Form] ${subject}`,
      text: `Message from ${user.username} <${user.email}>:\n\n${message}`,
      replyTo: user.email,
    });

    info("Contact mail sent", {
      userId: user._id,
      to,
    });

    return res.json({
      message: "Message sent",
    });
  } catch (err) {
    error("Failed to send contact email", { err });

    return res.status(500).json({
      message: "Error sending email",
    });
  }
}