# La Ruleta Caliente

Videochat en vivo 1 a 1 con desconocidos, estilo Chatroulette / CooMeet. Solo para mayores de 18 años.

## Cómo arrancarlo

```bash
cd videochat
npm install
ADMIN_PASSWORD=una-clave-segura npm start      # http://localhost:3000
```

Abre dos navegadores (o una ventana normal y otra privada), crea una cuenta en cada uno y pulsa «Empezar».

## Qué incluye

- **Portada** profesional: presentación, cómo funciona, seguridad, Premium y pie con enlaces legales.
- **Aviso de mayoría de edad** al entrar por primera vez.
- **Cuentas de usuario**: registro con email, contraseña (guardada cifrada con scrypt) y si eres
  mujer, hombre, transexual o pareja. Inicio de sesión en cualquier dispositivo.
- **Recuperar contraseña por email**: «¿Olvidaste tu contraseña?» envía un enlace (válido 1 hora,
  de un solo uso, en el idioma del usuario). Al cambiarla se cierran las demás sesiones.
- **Entrar con Google, Apple o Facebook** (además de email y contraseña). Si es la primera vez,
  solo se pide qué eres y aceptar las normas (mayor de 18). Si ya había una cuenta con ese email,
  se vinculan. El email queda confirmado. Las cuentas sin contraseña confirman el borrado
  escribiendo su email (y pueden crear una contraseña con «¿Olvidaste tu contraseña?»).
- **Verificación de edad** como en DirtyRoulette: al registrarse basta con confirmar «Tengo 18 años
  o más». **Solo** si alguien denuncia a una cuenta por «Parece menor de edad», o el administrador
  lo pide desde `/admin`, esa cuenta sale del chat y tiene que verificarse con Veriff (documento +
  selfie) para seguir. Con `AGE_VERIFICATION=all` se pide a todo el mundo; con `off`, a nadie.
  Si sale menor de edad, la cuenta queda expulsada. No se guarda el documento ni la fecha de
  nacimiento, solo el resultado. El panel de moderación muestra el estado de cada usuario.
- **Videochat** 1 a 1 con WebRTC: Empezar, Siguiente (o tecla Esc), Parar y chat de texto.
- **Historial y amigos** (mezcla de CooMeet y DirtyRoulette), **solo con Premium**. Sin Premium
  se puede aceptar o rechazar las solicitudes que llegan y contestar llamadas de amigos Premium;
  el panel muestra la oferta («Ya tienes 3 personas en tu historial») y permite borrar el historial.
  Botón de personas en la cabecera:
  - **Historial**: con quién has hablado en los últimos 30 días (máx. 100), cuándo, cuánto duró y
    cuántas veces. Sin fotos: no se guarda ninguna imagen de nadie. Se puede borrar una entrada o todo.
  - **Amigos**: «Añadir amigo» sobre el vídeo durante la conversación o desde el historial. La otra
    persona acepta o rechaza (rechazar y bloquear no se le notifica). Máx. 300 amigos y 30
    solicitudes al día.
  - **En línea y llamadas**: con la web abierta (aunque no estés en el videochat) tus amigos ven si
    estás en línea, ocupado/a en una videollamada o desconectado/a, y pueden **llamarte**: te sale
    «X te está llamando» con Contestar/Rechazar (30 s). Al contestar se enciende la cámara.
  - **Nombre en el chat** opcional (en «Mi cuenta»); sin nombre se muestra «Mujer», «Hombre»…
    En `/admin` se ve el nombre, se puede buscar por él y quitarlo si es ofensivo.
  - **Bloquear**: desde amigos, solicitudes o historial. No volvéis a coincidir ni puede llamarte.
  - Privacidad: a cada persona se la identifica con un código distinto para cada quien la mira, así
    no se puede rastrear a nadie entre cuentas.
- **Más filtros Premium** («Más filtros», bajo «Quiero ver»):
  - **De dónde**: todo el mundo, **mi país** o **cerca de mí** (a menos de 100 km; `NEAR_KM` lo cambia).
    El país y la zona salen de la IP con la base de datos gratuita **DB-IP Lite** (CC BY 4.0: el
    crédito está en el pie de la web). Es aproximado (con datos móviles puede salir la ciudad de la
    operadora) y no se guarda: se calcula al conectar. La otra persona ve la bandera del país.
  - **Edad**: 18–24, 25–34, 35–44 o 45+. Usa la **fecha de nacimiento**, que ahora se pide al
    registrarse (también con Google/Apple/Facebook) en tres desplegables; si da menos de 18 años no
    deja registrarse. La fecha no la ve nadie; en el chat se muestra la **edad** junto al nombre
    («Ana · 27 · Mujer»). Las cuentas antiguas pueden añadirla una vez en «Mi cuenta»
    (después solo se cambia escribiendo a soporte); sin ella no salen en búsquedas por edad.
  - Los filtros cuentan para los dos lados: solo coincidís si los dos encajáis en lo que busca el otro.
    Si tras 25 s no aparece nadie, se sugiere ampliar los filtros. Sin Premium se ignoran.
- **Premium** en dos planes, **7,99 €/semana** o **19,99 €/mes** (el mensual sale un 42 % más barato), para elegir a quién ver (mujeres, hombres, transexuales o parejas). Va ligado
  a la cuenta: funciona en todos los dispositivos del usuario. Sin Premium, siempre al azar.
- **Denuncias** por burlas o insultos, acoso, homofobia o transfobia, menor de edad o contenido
  ilegal, u otro motivo:
  - Corta la conversación y las dos personas no vuelven a coincidir.
  - Guarda los últimos 30 mensajes del chat como prueba.
  - Suspensión automática de 24 h si 3 personas distintas denuncian a alguien en 24 h
    (2 si es por menores o contenido ilegal).
- **Panel de moderación** en `/admin` (con `ADMIN_PASSWORD`): denuncias pendientes (las urgentes
  primero), conversación denunciada, y botones para descartar, suspender 1 o 7 días, expulsar o
  readmitir. Al suspender o expulsar, la persona sale del chat al instante.
- **Protección de la imagen** (ningún navegador puede impedir grabar la pantalla; esto disuade y
  permite identificar a quien lo haga):
  - **Marca de agua invisible** sobre el vídeo con el **código de cuenta de quien mira** (p. ej.
    `7F3A-91C2`) y la hora. Cambia cada píxel solo 2 niveles de 255 (no se ve ni molesta) y se
    mueve cada 30 s. Para leerla: `/admin` → **Revelar código** → subir la captura o la grabación
    filtrada (en vídeo promedia 4 s de fotogramas). Luego se busca la cuenta en «Usuarios».
    Probado: con capturas de pantalla se lee; en grabaciones de vídeo comprimidas, a nivel 2 **no**
    se lee. Si se prefiere que sobreviva a grabaciones, subir `--wm-level` a 4 en `public/style.css`
    (se nota muy levemente en fondos lisos). Nivel 3 es intermedio.
  - El vídeo se difumina si la persona sale de la ventana o pulsa Imprimir pantalla /
    Cmd+Shift+3/4/5 / Win+Shift+S. Eso avisa a la otra persona y suma un intento de captura en la
    cuenta (visible en `/admin`).
  - Sin imagen en imagen, sin descargar, sin menú contextual ni arrastrar sobre el vídeo.
  - Nuevo motivo de denuncia: «Grabación o capturas sin permiso».
- **Protección de datos (RGPD)**:
  - «Mi cuenta»: ver datos, **descargar mis datos** (JSON) y **eliminar mi cuenta** (pide la
    contraseña). Los pagos se conservan sin datos personales; si la cuenta estaba expulsada se
    guarda solo un hash del email para que no pueda volver a registrarse.
  - Limpieza automática diaria: chat de denuncias resueltas a los 180 días, IP de registro a los 90,
    historial de chats y solicitudes de amistad sin responder a los 30.
  - Cabeceras de seguridad: CSP (solo código propio), HSTS con HTTPS, sin iframes, sin compartir
    pantalla desde la web.
- **Páginas legales** en los 6 idiomas: `/normas`, `/terminos` y `/privacidad`. Cada página lleva los
  6 textos (un `<article lang="…">` por idioma) y `public/legal.js` muestra el del idioma de la web.
  Las traducciones indican que, si hay diferencias, prevalece la versión en español.
- **Idiomas** (web internacional): **inglés por defecto**. Si el navegador está en español, portugués,
  francés, alemán o italiano, la web sale en ese idioma; con cualquier otro (japonés, ruso…), en
  inglés. El HTML base, el título y la vista previa al compartir el enlace están en inglés.
  El panel de moderación, el README y el código siguen en español (son para el equipo). Se puede cambiar en el selector del
  pie de página y del aviso de edad. Los textos están en `public/i18n.js`.
- **Traducción del chat**: si las dos personas hablan idiomas distintos, se muestra «Habla inglés»
  (o el que sea) junto a la otra persona y aparece «Traducir» bajo cada mensaje suyo. Necesita un
  proveedor de traducción (ver variables). Funciona con cualquier idioma, no solo los 6 de la web.
- **Reacciones 👍 Me gusta y ❤️ Me encanta**: botones sobre el vídeo durante la conversación.
  Al pulsar, las dos personas ven un estallido de emojis en pantalla y quien la recibe ve
  «¡Le encantas!». Cada usuario acumula sus likes (se ven junto a su etiqueta y en su propia
  cámara). Cada tipo cuenta una vez por conversación para que no se puedan inflar.

- **Cambiar de cámara**: botón sobre tu propia imagen (frontal/trasera o cualquier webcam), también
  en mitad de una conversación sin cortarla. Tu imagen se ve en espejo solo con la cámara frontal;
  se puede quitar el espejo en Mi cuenta → Privacidad.
- **Vista del videochat** (botón junto a «Parar»): cambiar el tamaño de tu recuadro (S, M, L, XL),
  intercambiar recuadros (tú en grande y la otra persona en pequeño; también con doble clic en el
  recuadro pequeño), vista amplia (oculta el chat de texto y los mensajes salen un momento sobre el
  vídeo) y pantalla completa. Se recuerda en el navegador. Al intercambiar, la marca de agua y el
  difuminado de protección siguen cubriendo el vídeo de la otra persona.
- **Mi cuenta** con pestañas: Perfil (datos, fecha de nacimiento, nombre en el chat), Seguridad
  (cambiar contraseña, cambiar email con enlace de confirmación al nuevo, cerrar sesión en todos los
  dispositivos), Privacidad (personas bloqueadas y desbloquear, espejo, descargar mis datos, eliminar
  la cuenta) y Notificaciones.
- **Notificaciones push** (aunque la web esté cerrada), **solo si la persona las activa** y el
  navegador da permiso: un amigo te llama, solicitud de amistad o un amigo se conecta (cada tipo se
  puede apagar). Al tocar el aviso se abre la web (o la pestaña que ya estaba abierta, sin cortar la
  videollamada). Claves VAPID generadas solas y guardadas en la base de datos.
- **Páginas propias**: Aviso legal (con el punto de contacto para autoridades del DSA), Cancelación
  y reembolsos, Sobre nosotros, Contacto (formulario con categorías y referencia C-XXXXXX) y
  Denunciar contenido (formulario público del DSA, sin cuenta; referencia N-XXXXXX, acuse de recibo y
  decisión por email).
- **Política de cookies** `/cookies` (6 idiomas) con la lista completa de lo que se guarda en el
  navegador. Todo es imprescindible o lo pide la persona (sesión, idioma, mayoría de edad, cámara
  elegida, cookie de seguridad de 10 min al entrar con Google/Apple/Facebook, caché de la app y
  avisos push con permiso), así que según el art. 22.2 de la LSSI **no hace falta banner de
  consentimiento**: se informa en el aviso de edad y en el pie. **Si algún día añades analítica
  (Google Analytics…), publicidad o píxeles, hace falta un banner con «Aceptar» y «Rechazar» al
  mismo nivel antes de cargarlos**, y actualizar la política.
- **Publicidad** sin molestar las llamadas: un hueco horizontal en la portada (728×90 en ordenador,
  320×100 en móvil) y uno vertical (160×600) a la derecha del videochat **solo en pantallas
  anchas** (≥1400 px), nunca encima del vídeo. Se gestiona en `/admin` → Publicidad: cada hueco
  puede estar desactivado, mostrar banners que vendes tú (subes la imagen, enlace y fechas; cuenta
  impresiones, clics y CTR sin cookies) o el código de una **red publicitaria para adultos**
  (ExoClick, TrafficStars, JuicyAds…). El código de la red va en un iframe aislado (sin acceso a la
  sesión) y **solo se carga si la persona acepta** el aviso de cookies de publicidad (Aceptar y
  Rechazar al mismo nivel; se puede cambiar en «Configurar cookies»). Con Premium de pago no hay
  anuncios. Cada hueco lleva la etiqueta «Publicidad» (art. 20 LSSI).
- **Centro de ayuda** `/ayuda` con 45 preguntas frecuentes en 6 idiomas, buscador, categorías y
  **Guindilla 🌶️**, la asistente que responde al momento: una guindilla dibujada con cara que aparece con un rebote, saluda con la mano, parpadea y mueve la boca al responder (sin sonido; se queda quieta si el sistema pide reducir el movimiento) (sin IA: busca palabras clave en cualquier
  idioma). También hay un botón flotante de Guindilla en la portada (se oculta durante el videochat).
- **Motivo de la sanción y recurso** (DSA art. 17 y 20): quien está suspendido o expulsado ve el
  motivo y puede recurrir una vez desde la propia ventana; el equipo responde desde el panel y, si
  acepta, la cuenta se readmite sola.
- **Anuncio general**: un aviso para todos (información o importante, en español e inglés, con
  caducidad) que se publica desde el panel y sale arriba en la web.
- **Panel del dueño** en `/admin`: resumen con conectados ahora, ingresos del periodo, neto,
  ingreso mensual recurrente, suscripciones nuevas, renovaciones, bajas, reembolsos y contracargos,
  conversión, gráficos por día (ingresos, visitantes, registros, conversaciones, suscripciones,
  máximo de conectados), países, idiomas, páginas, dispositivos, edades, tipos, motivos de denuncia,
  transparencia DSA y últimos pagos. Bandejas de denuncias, avisos DSA, recursos y mensajes de
  contacto (responder y cerrar con email automático), usuarios, anuncio y seguridad.
  Estadísticas **anónimas**: sin cookies ni IPs guardadas (visitantes únicos con un resumen que
  cambia cada día).
- **Seguridad del panel**: verificación en dos pasos (Google Authenticator, Authy…), sesiones de
  12 h que se pueden cerrar todas, bloqueo tras 5 contraseñas fallidas (con email al dueño) y
  registro de actividad. Ver [docs/seguridad-dueno.md](docs/seguridad-dueno.md).
- **Posicionamiento (SEO)**: cada página tiene su dirección en cada idioma (`/es/ayuda`,
  `/en/help`, `/fr/aide`, `/de/hilfe`, `/it/aiuto`, `/pt/ajuda`…) y el servidor la entrega ya
  traducida, con título y descripción propios, `canonical`, `hreflang` y datos estructurados
  (WebSite, Organization, FAQPage). `sitemap.xml` y `robots.txt` automáticos. Las direcciones
  antiguas sin idioma (`/ayuda`) llevan a la del idioma del navegador.

## Logo e iconos

Diseño hecho con Gemini y redibujado en vector para que se vea nítido a cualquier tamaño:

- `public/logo.svg` — icono (ruleta + llama) con fondo transparente: cabecera, pie y ventanas.
- `public/logo-full.png` — logo original completo con el nombre (para redes, emails, etc.).
- `public/favicon.svg` y `favicon.ico` — pestaña del navegador.
- `public/icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png` — iconos
  de la app instalable (Android, iPhone) declarados en `public/manifest.webmanifest`.
- `public/og-image.jpg` (1200×630) — vista previa al compartir el enlace (WhatsApp, X, Telegram…).

## Estructura

- `server.js` — servidor web y Socket.IO: emparejamiento, señalización WebRTC, chat y denuncias.
- `auth.js` — registro, inicio de sesión y sesiones.
- `payments.js` — pagos Premium con Segpay (tarjeta, Google Pay, Apple Pay y cripto).
- `moderation.js` — denuncias, suspensiones automáticas y API del panel de moderación.
- `store.js` — guarda usuarios, pedidos y denuncias en la base de datos SQLite `data/la-ruleta.db`.
- `backup.js` — copias de seguridad automáticas y manuales (`npm run backup`).
- `captcha.js` — protección contra bots (Cloudflare Turnstile).
- `tokens.js` — firma de las sesiones.
- `translate.js` — traducción de mensajes del chat (DeepL o LibreTranslate).
- `age.js` — verificación de edad con Veriff.
- `mailer.js` — envío de emails (confirmar cuenta, recuperar contraseña, avisos al administrador).
- `geo.js` — país y zona aproximados por IP (filtros Premium).
- `oauth.js` — entrar con Google, Apple o Facebook.
- `friends.js` — historial de chats, amigos y solicitudes (las llamadas y el «en línea» están en `server.js`).
- `privacy.js` — cabeceras de seguridad, descargar/borrar datos, limpieza automática y código de marca de agua.
- `public/` — la web: `index.html` (portada + chat), `app.js`, `style.css`, `admin.html`,
  páginas legales y `logo.svg`.
- `Dockerfile`, `docker-compose.yml`, `Caddyfile`, `.env.example` — publicación en servidor (ver DESPLIEGUE.md).
- `docs/` — documentos internos: registro de tratamientos, evaluación de impacto y lista de lanzamiento.

## Variables del servidor

```bash
ADMIN_PASSWORD=...            # contraseña del panel /admin (sin ella el panel está desactivado)
SESSION_SECRET=...            # frase larga y secreta; mantiene las sesiones tras reiniciar
BASE_URL=https://laruletacaliente.com

# Pagos (sin ellas, modo demo)
SEGPAY_ETICKET_CARD_WEEK=123456:7888     # semanal con tarjeta
SEGPAY_ETICKET_CRYPTO_WEEK=123456:7889   # semanal con cripto
SEGPAY_ETICKET_CARD=123456:7890          # mensual con tarjeta
SEGPAY_ETICKET_CRYPTO=123456:7891        # mensual con cripto
SEGPAY_POSTBACK_KEY=...
# SEGPAY_CANCEL_URL=https://cs.segpay.com

# Emails (confirmar email, recuperar contraseña y avisos). Sin SMTP_HOST salen en el registro del servidor.
ADMIN_EMAIL=tu@email.com         # recibe avisos: denuncias urgentes, suspensiones automáticas, menores
SMTP_HOST=smtp-relay.brevo.com   # o el de Mailgun, Amazon SES, Zoho, tu hosting…
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
MAIL_FROM="La Ruleta Caliente <no-reply@laruletacaliente.com>"

# Verificación de edad (sin las dos claves, modo demo: se simula)
VERIFF_API_KEY=...            # Veriff → Integrations → API key
VERIFF_SECRET=...             # Veriff → Integrations → Shared secret key
# AGE_VERIFICATION=reports    # por defecto: documento solo si le denuncian como menor
# AGE_VERIFICATION=all        # documento para todos antes del primer videochat
# AGE_VERIFICATION=off        # nunca

# Entrar con Google / Apple / Facebook (cada botón aparece si están sus claves)
# GOOGLE_CLIENT_ID=... / GOOGLE_CLIENT_SECRET=...
# APPLE_CLIENT_ID=... / APPLE_TEAM_ID=... / APPLE_KEY_ID=... / APPLE_PRIVATE_KEY_FILE=/ruta/clave.p8
# FACEBOOK_APP_ID=... / FACEBOOK_APP_SECRET=...

# Traducción del chat (uno de los dos; sin ninguno, no aparece «Traducir»)
DEEPL_API_KEY=...             # deepl.com/pro-api — la clave gratuita (500.000 caracteres/mes) termina en :fx
# LIBRETRANSLATE_URL=https://tu-libretranslate.com   # alternativa gratuita que puedes instalar tú
# LIBRETRANSLATE_API_KEY=...

# Vídeo en redes móviles (servidor TURN, p. ej. coturn)
TURN_URL=turn:turn.tudominio.com:3478?transport=udp,turn:turn.tudominio.com:3478?transport=tcp
TURN_SECRET=...               # static-auth-secret de coturn: credenciales que caducan a las 12 h
# TURN_USER=... / TURN_PASS=... # alternativa: usuario y contraseña fijos
# STUN_URL=stun:tudominio.com:3478  # STUN propio (sin TURN se usa el de Google)
# RELAY_ONLY=off              # con TURN, el vídeo pasa siempre por él para ocultar la IP de cada uno; off lo desactiva

# Lanzamiento sin cobrar: filtros Premium gratis para todos
# PREMIUM_MODE=free

# Antibots (Cloudflare Turnstile)
# TURNSTILE_SITE_KEY=... / TURNSTILE_SECRET=...

# Ubicación aproximada por IP (filtros «Mi país» y «Cerca de mí»)
# Por defecto se descarga sola cada mes la base de datos gratuita de DB-IP en data/geoip/ (~130 MB)
# GEOIP_AUTO_UPDATE=off       # no descargar (los filtros por país y cercanía no aparecen)
# GEOIP_DB=/ruta/a.mmdb       # usar otro archivo .mmdb (o varios separados por comas)
# NEAR_KM=100                 # distancia de «Cerca de mí»

# Notificaciones push (opcional: si no se ponen, se generan solas y se guardan en la base de datos)
# VAPID_PUBLIC_KEY=... / VAPID_PRIVATE_KEY=...   # npx web-push generate-vapid-keys
# VAPID_SUBJECT=mailto:soporte@laruletacaliente.com

# Datos
# DB_FILE=/ruta/la-ruleta.db  # por defecto videochat/data/la-ruleta.db (SQLite)
# BACKUP_KEEP=14              # copias automáticas en data/copias (al arrancar y cada 24 h)
# BACKUP_DIR=off              # desactiva las copias automáticas
# TRUST_PROXY=...             # de qué proxies se fía para la IP real (por defecto: red interna)
```

Para publicarlo en un servidor con Docker, HTTPS automático y TURN: **[DESPLIEGUE.md](DESPLIEGUE.md)**.
Copia de seguridad manual: `npm run backup`.

## Pagos (Segpay)

En la ventana Premium el usuario elige cómo pagar. Los dos métodos se cobran con Segpay:

| Plan · método | Paquete de Segpay | Cómo se cobra |
|---|---|---|
| Semanal · Tarjeta / Google Pay / Apple Pay | `SEGPAY_ETICKET_CARD_WEEK` | 7,99 € cada 7 días, se renueva solo |
| Semanal · Criptomonedas | `SEGPAY_ETICKET_CRYPTO_WEEK` | 7,99 € una vez = 7 días |
| Mensual · Tarjeta / Google Pay / Apple Pay | `SEGPAY_ETICKET_CARD` | 19,99 € cada 30 días, se renueva solo |
| Mensual · Criptomonedas | `SEGPAY_ETICKET_CRYPTO` | 19,99 € una vez = 30 días |

(Segpay no permite cripto recurrente, por eso con cripto es un pago único por el periodo.)
Si falta el paquete de alguna combinación, ese botón no aparece para ese plan.

Para pagar hay que tener la sesión iniciada; el Premium queda en la cuenta.

### Qué configurar en el Merchant Portal de Segpay

1. **Cuatro payment packages** (o los que te prepare tu comercial de Segpay):
   - Tarjeta semanal: 7,99 € por 7 días y renovación de 7,99 € cada 7 días.
   - Tarjeta mensual: 19,99 € por 30 días y renovación de 19,99 € cada 30 días.
     Pide que activen **Google Pay y Apple Pay** en los paquetes de tarjeta.
   - Cripto semanal: 7,99 € por 7 días sin renovación.
   - Cripto mensual: 19,99 € por 30 días sin renovación. Pide que activen **cripto** en la cuenta y en estos paquetes.
   De cada paquete copia su `x-eticketid` (formato `paquete:precio`, p. ej. `123456:7890`).
2. **Postbacks** (My Websites → Manage Postbacks), con "Use SSL" y respuesta esperada `OK`:
   - **Trans Post**:
     `laruletacaliente.com/api/segpay/postback?key=TU_CLAVE&action=<action>&stage=<stage>&approved=<approved>&trantype=<trantype>&purchaseid=<purchaseid>&orderid=<extra orderid>&iint=<iint>&rint=<rint>`
   - **Disable**:
     `laruletacaliente.com/api/segpay/postback?key=TU_CLAVE&type=disable&purchaseid=<purchaseid>`
   - Activa "Retry postback" para que Segpay reintente si el servidor no responde.

## Verificación de edad (Veriff)

1. Crea una cuenta en veriff.com y una integración. Copia la **API key** y la **Shared secret key**.
2. En la integración pon como **Decision webhook URL**: `https://laruletacaliente.com/api/age/webhook`.
3. Pon las dos claves en el servidor (`VERIFF_API_KEY`, `VERIFF_SECRET`).

Cuando a una cuenta se le pide verificarse (denuncia «Parece menor de edad», botón «Pedir
verificación de edad» en `/admin`, o a todos con `AGE_VERIFICATION=all`), sale del chat, ve la
ventana «Verifica tu edad», va a la página de Veriff y al volver la web espera el resultado. El
servidor rechaza su conexión al chat hasta que esté verificada.

## Antes de abrir al público

- **Completa las páginas legales**: en `/terminos` y `/privacidad` hay datos marcados en amarillo
  (titular, NIF, dirección…) en cada uno de los 6 idiomas. Revísalas con un abogado; si cambias el
  texto en español, cambia también las traducciones.
- **Crea el buzón `soporte@laruletacaliente.com`** (aparece en la web).
- **HTTPS y servidor TURN**: incluidos en `docker-compose.yml` (ver DESPLIEGUE.md).
- **Copias de seguridad**: automáticas cada 24 h; descárgalas fuera del servidor cada semana.
- **Contratar Veriff** y un servicio de envío de emails (Brevo tiene plan gratuito) y poner sus claves.
- Lista completa de lanzamiento y documentos internos de protección de datos: carpeta `docs/`.
- Con muchos miles de usuarios a la vez, pasar de SQLite a PostgreSQL.
