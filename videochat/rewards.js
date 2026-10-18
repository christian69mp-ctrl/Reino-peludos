// Guindillas (puntos), racha diaria, insignias, retos semanales y superpoderes.
//
// - Las guindillas se ganan gratis usando la web (entrar cada día, jugar, recibir ❤️ y
//   piropos, conversaciones de más de 1 minuto, retos) con un máximo diario para que no se
//   puedan «granjear». No se compran con dinero ni hay premios al azar.
// - Superpoderes: se pagan con guindillas; Premium tiene algunos gratis.
//   🔥 Llama caliente: 15 min saliendo antes en la cola. ↩️ Rebobinar: volver a intentar con
//   la persona anterior (si acepta). 💌 Supersaludo: un saludo destacado que la siguiente
//   persona ve nada más conectar. 🕶️ Incógnito: 1 h sin mostrar edad ni país. 👀 Segunda
//   oportunidad: ver quién te ha dado ❤️ en las últimas 24 h.
// - 🔥 Hora caliente: una hora al día (por defecto 22:00-23:00, hora de España) en la que las
//   guindillas que se ganan valen el doble.
// - 🏆 Ranking semanal: las 10 personas que más guindillas han ganado esta semana (solo con su
//   nombre del chat; quien no quiera salir puede ocultarse en Privacidad).
const DAY = 24 * 3600 * 1000;
const DAY_CAP = 120;              // guindillas máximas por día (sin contar retos)

const PRICES = { flame: 30, rewind: 20, super: 10, incognito: 15, second: 15 };
// Premium: rebobinar, incógnito y segunda oportunidad sin límite; 1 llama y 3 supersaludos al día
const PREMIUM_FREE = { rewind: Infinity, incognito: Infinity, second: Infinity, flame: 1, super: 3 };

const BADGES = [
  { id: 'icebreaker', e: '🧊', key: 'games', goal: 10 },
  { id: 'winner', e: '🏆', key: 'rpsWins', goal: 10 },
  { id: 'soulmates', e: '💞', key: 'wyrMatches', goal: 20 },
  { id: 'polyglot', e: '🌍', key: 'countries', goal: 5 },
  { id: 'social', e: '🗣️', key: 'convs', goal: 100 },
  { id: 'heartbreaker', e: '💘', key: 'likes', goal: 50 },
  { id: 'spicy', e: '🌶️', key: 'piropos', goal: 25 },
  { id: 'onfire', e: '🔥', key: 'bestStreak', goal: 7 },
  { id: 'chem', e: '🌡️', key: 'hotChem', goal: 5 },
];
const CHALLENGES = [
  { id: 'countries3', key: 'countries', goal: 3, reward: 50 },
  { id: 'games5', key: 'games', goal: 5, reward: 50 },
  { id: 'likes10', key: 'likes', goal: 10, reward: 50 },
  { id: 'convs15', key: 'convs', goal: 15, reward: 50 },
  { id: 'rps3', key: 'rpsWins', goal: 3, reward: 50 },
  { id: 'wyr5', key: 'wyrMatches', goal: 5, reward: 50 },
];

const HOT_OFF = process.env.HOT_HOUR === 'off';
const HOT_HOUR = Math.min(23, Math.max(0, Number(process.env.HOT_HOUR ?? 22) || 0));
const HOT_TZ = process.env.HOT_TZ || 'Europe/Madrid';
// ¿Es ahora la Hora caliente? Devuelve también cuándo empieza o acaba (en ms)
function hotHour(now = Date.now()) {
  if (HOT_OFF) return { active: false, off: true };
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: HOT_TZ, hourCycle: 'h23', hour: '2-digit', minute: '2-digit', second: '2-digit' })
    .formatToParts(new Date(now)).filter((x) => x.type !== 'literal').map((x) => [x.type, Number(x.value)]));
  const intoHour = (parts.minute * 60 + parts.second) * 1000 + (now % 1000);
  const hourStart = now - intoHour;
  const active = parts.hour === HOT_HOUR;
  const hoursUntil = (HOT_HOUR - parts.hour + 24) % 24;
  return active
    ? { active: true, endsAt: hourStart + 3600 * 1000 }
    : { active: false, startsAt: hourStart + hoursUntil * 3600 * 1000 };
}

const dayKey = (t = Date.now()) => new Date(t).toISOString().slice(0, 10);
function weekKey(t = Date.now()) {
  const d = new Date(t);
  const day = (d.getUTCDay() + 6) % 7;            // lunes = 0
  d.setUTCDate(d.getUTCDate() - day + 3);         // jueves de esta semana (ISO 8601)
  const first = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const n = 1 + Math.round(((d - first) / DAY - 3 + ((first.getUTCDay() + 6) % 7)) / 7);
  return `${d.getUTCFullYear()}-W${String(n).padStart(2, '0')}`;
}
// 3 retos por semana, los mismos para todo el mundo, que van rotando
function weekChallenges(week = weekKey()) {
  const n = Number(week.slice(-2)) || 0;
  return [0, 2, 4].map((k) => CHALLENGES[(n + k) % CHALLENGES.length]);
}

module.exports = function createRewards({ store, payments, notify }) {
  // Con PREMIUM_MODE=free todo el mundo es Premium, pero los superpoderes se siguen pagando
  // con guindillas: solo un Premium pagado los tiene gratis.
  const paid = (uid) => !payments.FREE && payments.isPremium(uid);
  function state(user) {
    const g = user.game || {};
    const week = weekKey();
    const today = dayKey();
    return {
      points: g.points || 0,
      streak: g.streak || { n: 0, last: null },
      counters: g.counters || {},
      countries: g.countries || [],
      badges: g.badges || [],
      weekly: g.weekly?.week === week ? g.weekly : { week, prog: {}, countries: [], done: [], earned: 0 },
      daily: g.daily?.day === today ? g.daily : { day: today, earned: 0, used: {} },
    };
  }
  const save = (uid, s) => store.updateUser(uid, { game: s });

  function award(uid, amount, reason, { uncapped = false } = {}) {
    const user = store.getUser(uid);
    if (!user || amount <= 0) return 0;
    const s = state(user);
    const hot = hotHour().active;
    if (hot) amount *= 2;
    const add = uncapped ? amount : Math.max(0, Math.min(amount, DAY_CAP - s.daily.earned));
    if (!add) return 0;
    s.points += add;
    s.weekly.earned = (s.weekly.earned || 0) + add;
    if (!uncapped) s.daily.earned += add;
    save(uid, s);
    rankCache = null;
    notify(uid, 'points', { points: s.points, added: add, reason, hot });
    return add;
  }

  // Suma a un contador (insignias y retos de la semana). value: país para «countries»
  function count(uid, key, value) {
    const user = store.getUser(uid);
    if (!user) return;
    const s = state(user);
    if (key === 'countries') {
      if (!value) return;
      if (!s.countries.includes(value)) s.countries = [...s.countries, value].slice(-300);
      if (!s.weekly.countries.includes(value)) s.weekly.countries = [...s.weekly.countries, value];
      s.counters.countries = s.countries.length;
      s.weekly.prog.countries = s.weekly.countries.length;
    } else {
      s.counters[key] = (s.counters[key] || 0) + 1;
      s.weekly.prog[key] = (s.weekly.prog[key] || 0) + 1;
    }
    const events = [];
    for (const b of BADGES) {
      if (!s.badges.includes(b.id) && (s.counters[b.key] || 0) >= b.goal) { s.badges = [...s.badges, b.id]; events.push(['badge', { id: b.id, e: b.e }]); }
    }
    let bonus = 0;
    for (const c of weekChallenges(s.weekly.week)) {
      if (!s.weekly.done.includes(c.id) && (s.weekly.prog[c.key] || 0) >= c.goal) {
        s.weekly.done = [...s.weekly.done, c.id];
        s.points += c.reward; bonus += c.reward;
        s.weekly.earned = (s.weekly.earned || 0) + c.reward;
        rankCache = null;
        events.push(['challenge', { id: c.id, reward: c.reward }]);
      }
    }
    save(uid, s);
    for (const [ev, data] of events) notify(uid, ev, data);
    if (bonus) notify(uid, 'points', { points: s.points, added: bonus, reason: 'challenge' });
  }

  // Primera conexión del día: racha y premio (5 por día de racha, máx. 30)
  function dailyLogin(uid) {
    const user = store.getUser(uid);
    if (!user) return;
    const s = state(user);
    const today = dayKey();
    if (s.streak.last === today) return;
    const yesterday = dayKey(Date.now() - DAY);
    s.streak = { n: s.streak.last === yesterday ? s.streak.n + 1 : 1, last: today };
    s.counters.bestStreak = Math.max(s.counters.bestStreak || 0, s.streak.n);
    const reward = Math.min(5 * s.streak.n, 30);
    s.points += reward;
    s.weekly.earned = (s.weekly.earned || 0) + reward;
    save(uid, s);
    rankCache = null;
    notify(uid, 'daily', { streak: s.streak.n, reward, points: s.points });
    count(uid, 'login');
  }

  // Pagar un superpoder: gratis si Premium lo incluye hoy; si no, con guindillas
  function spend(uid, power) {
    const user = store.getUser(uid);
    if (!user || !PRICES[power]) return { code: 'invalid' };
    const s = state(user);
    const premium = paid(uid);
    const used = s.daily.used[power] || 0;
    if (premium && used < PREMIUM_FREE[power]) {
      s.daily.used = { ...s.daily.used, [power]: used + 1 };
      save(uid, s);
      return { ok: true, free: true, points: s.points };
    }
    if (s.points < PRICES[power]) return { code: 'points', need: PRICES[power], points: s.points };
    s.points -= PRICES[power];
    s.daily.used = { ...s.daily.used, [power]: used + 1 };
    save(uid, s);
    notify(uid, 'points', { points: s.points, added: -PRICES[power], reason: power });
    return { ok: true, points: s.points };
  }
  function canSpend(uid, power) {
    const user = store.getUser(uid);
    if (!user) return false;
    const s = state(user);
    const used = s.daily.used[power] || 0;
    return (paid(uid) && used < PREMIUM_FREE[power]) || s.points >= PRICES[power];
  }

  // Todo lo que la web necesita para el panel de guindillas
  function summary(uid) {
    const user = store.getUser(uid);
    const s = state(user);
    const premium = paid(uid);
    const now = Date.now();
    return {
      points: s.points,
      streak: s.streak.last === dayKey() || s.streak.last === dayKey(now - DAY) ? s.streak.n : 0,
      premium,
      prices: PRICES,
      free: Object.fromEntries(Object.keys(PRICES).map((p) => [p, premium ? (PREMIUM_FREE[p] === Infinity ? 999 : Math.max(0, PREMIUM_FREE[p] - (s.daily.used[p] || 0))) : 0])),
      boostUntil: user.boostUntil > now ? user.boostUntil : null,
      incognitoUntil: user.incognitoUntil > now ? user.incognitoUntil : null,
      superMsg: user.superMsg || '',
      badges: BADGES.map((b) => ({ ...b, have: s.badges.includes(b.id), progress: Math.min(s.counters[b.key] || 0, b.goal) })),
      challenges: weekChallenges(s.weekly.week).map((c) => ({ ...c, progress: Math.min(s.weekly.prog[c.key] || 0, c.goal), done: s.weekly.done.includes(c.id) })),
      hot: hotHour(),
      weekEnds: (() => { const d = new Date(); const day = (d.getUTCDay() + 6) % 7; return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 7 - day); })(),
    };
  }

  // 🏆 Ranking de la semana (se recalcula como mucho cada 30 s)
  let rankCache = null;
  function ranking(uid) {
    const week = weekKey();
    if (!rankCache || rankCache.week !== week || Date.now() - rankCache.at > 30000) {
      const rows = store.listUsers()
        .filter((u) => u.game?.weekly?.week === week && u.game.weekly.earned > 0 && u.status !== 'banned' && u.status !== 'deleted')
        .map((u) => ({ id: u.id, earned: u.game.weekly.earned }))
        .sort((a, b) => b.earned - a.earned);
      rankCache = { week, at: Date.now(), rows };
    }
    // Nombre, insignias y «no aparecer» se leen al momento (pueden cambiar sin ganar guindillas)
    const rows = rankCache.rows.map((r) => {
      const u = store.getUser(r.id) || {};
      return { ...r, hidden: !!u.prefs?.hideRanking, name: u.nick || '', badges: badgesOf(u) };
    });
    const visible = rows.filter((r) => !r.hidden);
    const mine = rows.findIndex((r) => r.id === uid);
    return {
      week,
      top: visible.slice(0, 10).map((r) => ({ name: r.name, earned: r.earned, badges: r.badges, me: r.id === uid })),
      me: mine >= 0 ? { pos: mine + 1, earned: rows[mine].earned, hidden: rows[mine].hidden } : null,
      players: rows.length,
    };
  }

  const badgesOf = (user) => (user?.game?.badges || []).map((id) => BADGES.find((b) => b.id === id)?.e).filter(Boolean).slice(-3);

  return { award, count, dailyLogin, spend, canSpend, summary, badgesOf, ranking, hotHour, PRICES, _test: { weekKey, weekChallenges, hotHour } };
};
