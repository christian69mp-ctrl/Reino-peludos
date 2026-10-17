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

const VERIFY = {
  es: {
    subject: 'Confirma tu email · La Ruleta Caliente',
    hello: '¡Hola!',
    body: 'Gracias por registrarte. Pulsa el botón para confirmar tu email y activar tu cuenta. El enlace caduca en 48 horas.',
    button: 'Confirmar mi email',
    ignore: 'Si no has creado una cuenta en La Ruleta Caliente, ignora este email.',
  },
  en: {
    subject: 'Confirm your email · La Ruleta Caliente',
    hello: 'Hi!',
    body: 'Thanks for signing up. Press the button to confirm your email and activate your account. The link expires in 48 hours.',
    button: 'Confirm my email',
    ignore: 'If you did not create an account on La Ruleta Caliente, ignore this email.',
  },
  pt: {
    subject: 'Confirme seu e-mail · La Ruleta Caliente',
    hello: 'Olá!',
    body: 'Obrigado por se cadastrar. Toque no botão para confirmar seu e-mail e ativar sua conta. O link expira em 48 horas.',
    button: 'Confirmar meu e-mail',
    ignore: 'Se você não criou uma conta na La Ruleta Caliente, ignore este e-mail.',
  },
  fr: {
    subject: 'Confirmez votre e-mail · La Ruleta Caliente',
    hello: 'Bonjour !',
    body: 'Merci pour votre inscription. Appuyez sur le bouton pour confirmer votre e-mail et activer votre compte. Le lien expire dans 48 heures.',
    button: 'Confirmer mon e-mail',
    ignore: 'Si vous n’avez pas créé de compte sur La Ruleta Caliente, ignorez cet e-mail.',
  },
  de: {
    subject: 'Bestätige deine E-Mail · La Ruleta Caliente',
    hello: 'Hallo!',
    body: 'Danke für deine Registrierung. Tippe auf den Button, um deine E-Mail zu bestätigen und dein Konto zu aktivieren. Der Link läuft in 48 Stunden ab.',
    button: 'E-Mail bestätigen',
    ignore: 'Wenn du kein Konto bei La Ruleta Caliente erstellt hast, ignoriere diese E-Mail.',
  },
  it: {
    subject: 'Conferma la tua email · La Ruleta Caliente',
    hello: 'Ciao!',
    body: 'Grazie per esserti registrato/a. Premi il pulsante per confermare la tua email e attivare l’account. Il link scade tra 48 ore.',
    button: 'Conferma la mia email',
    ignore: 'Se non hai creato un account su La Ruleta Caliente, ignora questa email.',
  },
};

// Email con un botón, con el diseño de la marca
async function sendTemplate(to, s, link, label) {
  if (!transport) {
    console.log(`[email] (sin SMTP) ${label} para ${to}: ${link}`);
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

function sendPasswordReset(to, link, lang) {
  return sendTemplate(to, RESET[lang] || RESET.en, link, 'recuperar contraseña');
}

function sendVerifyEmail(to, link, lang) {
  return sendTemplate(to, VERIFY[lang] || VERIFY.en, link, 'confirmar email');
}

// Aviso interno al equipo (texto simple, en español)
async function sendAdminAlert(subject, text) {
  const to = process.env.ADMIN_EMAIL;
  if (!to) return;
  if (!transport) {
    console.log(`[email] (sin SMTP) aviso al admin: ${subject}\n${text}`);
    return;
  }
  await transport.sendMail({ from: FROM, to, subject: `[La Ruleta Caliente] ${subject}`, text });
}

// Email de texto a un usuario (respuestas del equipo, acuses de recibo…)
async function sendText(to, subject, text, replyTo) {
  if (!to) return;
  if (!transport) {
    console.log(`[email] (sin SMTP) para ${to}: ${subject}\n${text}`);
    return;
  }
  await transport.sendMail({ from: FROM, to, subject: `${subject} · La Ruleta Caliente`, text, ...(replyTo ? { replyTo } : {}) });
}

module.exports = { sendPasswordReset, sendVerifyEmail, sendAdminAlert, sendText, enabled: !!transport };
