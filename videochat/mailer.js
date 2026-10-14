// Envío de emails (recuperar contraseña) por SMTP: sirve cualquier proveedor
// (Brevo, Mailgun, Amazon SES, Zoho, el correo de tu hosting…).
// Sin SMTP_HOST, los emails no se envían y el enlace se muestra en el registro
// del servidor, para poder probar.

const nodemailer = require('nodemailer');

const FROM = process.env.MAIL_FROM || 'La Ruleta Caliente <no-reply@laruletacaliente.com>';
const transport = process.env.SMTP_HOST
  ? nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  })
  : null;
if (!transport) console.warn('[email] SMTP_HOST no definido: los emails no se envían, el enlace aparece en este registro.');

const RESET = {
  es: {
    subject: 'Crea una contraseña nueva · La Ruleta Caliente',
    hello: 'Hola:',
    body: 'Hemos recibido una petición para cambiar la contraseña de tu cuenta. Pulsa el botón para crear una nueva. El enlace caduca en 1 hora.',
    button: 'Crear contraseña nueva',
    ignore: 'Si no lo has pedido tú, ignora este email: tu contraseña no cambiará.',
  },
  en: {
    subject: 'Create a new password · La Ruleta Caliente',
    hello: 'Hi,',
    body: 'We received a request to change your account password. Press the button to create a new one. The link expires in 1 hour.',
    button: 'Create new password',
    ignore: 'If you did not request this, ignore this email: your password will not change.',
  },
  pt: {
    subject: 'Crie uma nova senha · La Ruleta Caliente',
    hello: 'Olá,',
    body: 'Recebemos um pedido para alterar a senha da sua conta. Toque no botão para criar uma nova. O link expira em 1 hora.',
    button: 'Criar nova senha',
    ignore: 'Se não foi você, ignore este e-mail: sua senha não será alterada.',
  },
  fr: {
    subject: 'Créez un nouveau mot de passe · La Ruleta Caliente',
    hello: 'Bonjour,',
    body: 'Nous avons reçu une demande de changement du mot de passe de votre compte. Appuyez sur le bouton pour en créer un nouveau. Le lien expire dans 1 heure.',
    button: 'Créer un nouveau mot de passe',
    ignore: 'Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail : votre mot de passe ne changera pas.',
  },
  de: {
    subject: 'Neues Passwort erstellen · La Ruleta Caliente',
    hello: 'Hallo,',
    body: 'Wir haben eine Anfrage zum Ändern deines Passworts erhalten. Tippe auf den Button, um ein neues zu erstellen. Der Link läuft in 1 Stunde ab.',
    button: 'Neues Passwort erstellen',
    ignore: 'Wenn du das nicht angefordert hast, ignoriere diese E-Mail: Dein Passwort bleibt unverändert.',
  },
  it: {
    subject: 'Crea una nuova password · La Ruleta Caliente',
    hello: 'Ciao,',
    body: 'Abbiamo ricevuto una richiesta per cambiare la password del tuo account. Premi il pulsante per crearne una nuova. Il link scade tra 1 ora.',
    button: 'Crea nuova password',
    ignore: 'Se non sei stato tu, ignora questa email: la tua password non cambierà.',
  },
};

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

async function sendPasswordReset(to, link, lang) {
  const s = RESET[lang] || RESET.en;
  if (!transport) {
    console.log(`[email] (sin SMTP) recuperar contraseña para ${to}: ${link}`);
    return;
  }
  await transport.sendMail({
    from: FROM,
    to,
    subject: s.subject,
    text: `${s.hello}\n\n${s.body}\n\n${link}\n\n${s.ignore}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#1d1925">
        <h2 style="margin:0 0 16px">La Ruleta <span style="color:#ff3d6e">Caliente</span></h2>
        <p>${esc(s.hello)}</p>
        <p>${esc(s.body)}</p>
        <p style="margin:28px 0">
          <a href="${esc(link)}" style="background:#ff3d6e;color:#fff;padding:14px 22px;border-radius:10px;text-decoration:none;font-weight:bold">${esc(s.button)}</a>
        </p>
        <p style="color:#6b6475;font-size:13px">${esc(s.ignore)}</p>
      </div>`,
  });
}

module.exports = { sendPasswordReset };
