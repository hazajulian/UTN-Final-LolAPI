import 'dotenv/config';
import { sendMail } from '../utils/mail-service.js';
import { info, error } from '../utils/logger.js';

export async function contactController(req, res) {
  const { subject, message } = req.body;
  const user = req.user;

  const to = process.env.CONTACT_RECEIVER;
  if (!to) {
    return res.status(500).json({ message: 'CONTACT_RECEIVER no está configurado en el servidor' });
  }

  try {
    await sendMail({
      to,
      subject: `[Contact Form] ${subject}`,
      text: `Mensaje de ${user.username} <${user.email}>:\n\n${message}`
    });

    info('Contact mail sent', { userId: user._id, to });
    return res.json({ message: 'Message sent!' });
  } catch (err) {
    error('Failed to send contact email', { err });
    return res.status(500).json({ message: 'Error sending email' });
  }
}
