// Premium de regalo (sin pagar), igual para todo el mundo:
// - 🎁 Prueba al crear la cuenta: desactivada por defecto; con TRIAL_DAYS=n en .env se dan n días
//   (una vez por email, aunque se borre y se vuelva a crear).
// - 🤝 Invita a un amigo: cuando la persona invitada tiene su primera conversación de más de un
//   minuto, las dos ganan 1 día de Premium (máximo 10 invitaciones premiadas al mes).
// - 🏆 Ranking semanal: el lunes, las 3 personas con más guindillas de la semana anterior ganan
//   Premium (1.º 7 días, 2.º 3 días, 3.º 1 día).
// Los días se acumulan sobre los que ya tuviera la persona. Con PREMIUM_MODE=free no se regala
// nada (ya es todo gratis).
const crypto = require('crypto');

const DAY = 24 * 3600 * 1000;
const TRIAL_DAYS = Math.max(0, Number(process.env.TRIAL_DAYS) || 0);   // sin prueba salvo que se active
const INVITE_DAYS = 1;
const INVITE_MONTH_MAX = 10;
const CLAIM_WINDOW = DAY;            // la invitación se reclama en las primeras 24 h de la cuenta
const RANK_PRIZES = [7, 3, 1];
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const sha256 = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');
const monthKey = (t = Date.now()) => new Date(t).toISOString().slice(0, 7);

module.exports = function createGifts({ store, payments, rewards, notify, online, onPremium }) {
  const enabled = () => !payments.FREE;

  // Ajustes guardados en la tabla genérica «settings»
  const setting = (id, def) => store.get('settings', id) || { id, ...def };

  // Suma días de Premium de regalo y avisa a la persona (ahora o la próxima vez que entre)
  function grant(uid, days, reason) {
    const user = store.getUser(uid);
    if (!user || !enabled() || days <= 0) return null;
    const now = Date.now();
    const giftUntil = Math.max(now, user.giftUntil || 0) + days * DAY;
    const gift = { id: crypto.randomBytes(6).toString('hex'), at: now, days, reason, seen: false };
    store.updateUser(uid, { giftUntil, gifts: [...(user.gifts || []), gift].slice(-20) });
    if (online(uid)) deliver(uid);
    onPremium(uid);
    return giftUntil;
  }
  // Regalos pendientes de enseñar (al conectar)
  function deliver(uid) {
    const user = store.getUser(uid);
    const pending = (user?.gifts || []).filter((g) => !g.seen);
    if (!pending.length) return;
    for (const g of pending) notify(uid, 'gift', { days: g.days, reason: g.reason, until: user.giftUntil });
    store.updateUser(uid, { gifts: user.gifts.map((g) => ({ ...g, seen: true })) });
  }

  // ---------- 🎁 Prueba al crear la cuenta (opcional) ----------
  function welcome(user) {
    if (!enabled() || !TRIAL_DAYS || !user?.email) return;
    const used = setting('trialEmails', { hashes: {} });
    const h = sha256(user.email.toLowerCase());
    if (used.hashes[h]) return;
    store.put('settings', { ...used, hashes: { ...used.hashes, [h]: Date.now() } });
    grant(user.id, TRIAL_DAYS, 'trial');
  }

  // ---------- 🤝 Invita a un amigo ----------
  function codeOf(uid) {
    const user = store.getUser(uid);
    if (!user) return null;
    if (user.refCode) return user.refCode;
    const index = setting('refCodes', { codes: {} });
    let code;
    do code = Array.from(crypto.randomBytes(7), (b) => CODE_CHARS[b % CODE_CHARS.length]).join('');
    while (index.codes[code]);
    store.put('settings', { ...index, codes: { ...index.codes, [code]: uid } });
    store.updateUser(uid, { refCode: code });
    return code;
  }
  const ownerOf = (code) => setting('refCodes', { codes: {} }).codes[String(code || '').toUpperCase()] || null;

  // La persona nueva dice quién la invitó (en sus primeras 24 h). El premio llega después.
  function claim(user, code) {
    if (!enabled()) return { code: 'off' };
    if (user.referredBy) return { code: 'already' };
    if (Date.now() - (user.createdAt || 0) > CLAIM_WINDOW) return { code: 'late' };
    const inviter = store.getUser(ownerOf(code));
    if (!inviter || inviter.id === user.id) return { code: 'invalid' };
    if (inviter.status === 'banned') return { code: 'invalid' };
    // Misma conexión que quien invita: no cuenta (evita invitarse a uno mismo)
    if (inviter.registerIp && user.registerIp && inviter.registerIp === user.registerIp) return { code: 'sameNetwork' };
    store.updateUser(user.id, { referredBy: inviter.id, referralPaid: false });
    return { ok: true };
  }

  // Desde server.js, al terminar una conversación de más de un minuto
  function conversation(uid) {
    const user = store.getUser(uid);
    if (!user?.referredBy || user.referralPaid) return;
    store.updateUser(uid, { referralPaid: true });
    const inviter = store.getUser(user.referredBy);
    grant(uid, INVITE_DAYS, 'invited');
    if (!inviter || inviter.status === 'banned') return;
    const month = monthKey();
    const stats = inviter.invites?.month === month ? inviter.invites : { month, rewarded: 0 };
    const total = (inviter.invitesTotal || 0) + 1;
    if (stats.rewarded >= INVITE_MONTH_MAX) { store.updateUser(inviter.id, { invitesTotal: total }); return; }
    store.updateUser(inviter.id, { invites: { month, rewarded: stats.rewarded + 1 }, invitesTotal: total });
    grant(inviter.id, INVITE_DAYS, 'inviter');
  }

  function inviteInfo(uid, base) {
    const user = store.getUser(uid);
    const code = codeOf(uid);
    const month = monthKey();
    const pending = store.listUsers().filter((u) => u.referredBy === uid && !u.referralPaid).length;
    return {
      code,
      link: `${base}/?ref=${code}`,
      rewarded: user.invitesTotal || 0,
      pending,
      monthLeft: INVITE_MONTH_MAX - (user.invites?.month === month ? user.invites.rewarded : 0),
      days: INVITE_DAYS,
      enabled: enabled(),
    };
  }

  // ---------- 🏆 Premios del ranking de la semana anterior ----------
  function weeklyPrizes() {
    if (!enabled()) return;
    const prev = rewards.previousWeek();
    const id = `rankPrize:${prev}`;
    if (store.get('settings', id)) return;
    const winners = rewards.weekWinners(prev, RANK_PRIZES.length);
    store.put('settings', { id, at: Date.now(), winners: winners.map((w) => ({ uid: w.id, earned: w.earned })) });
    winners.forEach((w, i) => grant(w.id, RANK_PRIZES[i], `rank${i + 1}`));
  }

  return { grant, deliver, welcome, codeOf, claim, conversation, inviteInfo, weeklyPrizes, TRIAL_DAYS, INVITE_DAYS, RANK_PRIZES };
};
