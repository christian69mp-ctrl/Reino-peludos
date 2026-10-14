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
- **Verificación de edad con Veriff** (documento + selfie) antes de usar el videochat, una sola vez.
  Si sale menor de edad, la cuenta queda expulsada. No se guarda el documento ni la fecha de
  nacimiento, solo el resultado. El panel de moderación muestra el estado de cada usuario.
- **Videochat** 1 a 1 con WebRTC: Empezar, Siguiente (o tecla Esc), Parar y chat de texto.
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
  - Marca de agua sobre el vídeo con el **código de cuenta de quien mira** (p. ej. `7F3A-91C2`), la
    web y la hora; se mueve sola. En `/admin` → Usuarios se busca una cuenta por ese código.
  - El vídeo se difumina si la persona sale de la ventana o pulsa Imprimir pantalla /
    Cmd+Shift+3/4/5 / Win+Shift+S. Eso avisa a la otra persona y suma un intento de captura en la
    cuenta (visible en `/admin`).
  - Sin imagen en imagen, sin descargar, sin menú contextual ni arrastrar sobre el vídeo.
  - Nuevo motivo de denuncia: «Grabación o capturas sin permiso».
- **Protección de datos (RGPD)**:
  - «Mi cuenta»: ver datos, **descargar mis datos** (JSON) y **eliminar mi cuenta** (pide la
    contraseña). Los pagos se conservan sin datos personales; si la cuenta estaba expulsada se
    guarda solo un hash del email para que no pueda volver a registrarse.
  - Limpieza automática diaria: chat de denuncias resueltas a los 180 días, IP de registro a los 90.
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

## Estructura

- `server.js` — servidor web y Socket.IO: emparejamiento, señalización WebRTC, chat y denuncias.
- `auth.js` — registro, inicio de sesión y sesiones.
- `payments.js` — pagos Premium con Segpay (tarjeta, Google Pay, Apple Pay y cripto).
- `moderation.js` — denuncias, suspensiones automáticas y API del panel de moderación.
- `store.js` — guarda usuarios, pedidos y denuncias en `data/store.json`.
- `tokens.js` — firma de las sesiones.
- `translate.js` — traducción de mensajes del chat (DeepL o LibreTranslate).
- `age.js` — verificación de edad con Veriff.
- `mailer.js` — envío de emails (recuperar contraseña).
- `privacy.js` — cabeceras de seguridad, descargar/borrar datos, limpieza automática y código de marca de agua.
- `public/` — la web: `index.html` (portada + chat), `app.js`, `style.css`, `admin.html`,
  páginas legales y `logo.svg`.

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

# Emails (recuperar contraseña). Sin SMTP_HOST el enlace sale en el registro del servidor.
SMTP_HOST=smtp-relay.brevo.com   # o el de Mailgun, Amazon SES, Zoho, tu hosting…
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
MAIL_FROM="La Ruleta Caliente <no-reply@laruletacaliente.com>"

# Verificación de edad (sin las dos claves, modo demo: se simula)
VERIFF_API_KEY=...            # Veriff → Integrations → API key
VERIFF_SECRET=...             # Veriff → Integrations → Shared secret key
# AGE_VERIFICATION=off        # para desactivarla del todo

# Traducción del chat (uno de los dos; sin ninguno, no aparece «Traducir»)
DEEPL_API_KEY=...             # deepl.com/pro-api — la clave gratuita (500.000 caracteres/mes) termina en :fx
# LIBRETRANSLATE_URL=https://tu-libretranslate.com   # alternativa gratuita que puedes instalar tú
# LIBRETRANSLATE_API_KEY=...

# Vídeo en redes móviles
TURN_URL=turn:turn.tudominio.com:3478
TURN_USER=...
TURN_PASS=...

# DATA_FILE=/ruta/store.json  # por defecto videochat/data/store.json
```

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

Al pulsar «Empezar», quien no esté verificado ve la ventana «Verifica tu edad», va a la página de
Veriff y al volver la web espera el resultado. El servidor también rechaza la conexión al chat de
cualquier cuenta sin verificar.

## Antes de abrir al público

- **Completa las páginas legales**: en `/terminos` y `/privacidad` hay datos marcados en amarillo
  (titular, NIF, dirección…) en cada uno de los 6 idiomas. Revísalas con un abogado; si cambias el
  texto en español, cambia también las traducciones.
- **Crea el buzón `soporte@laruletacaliente.com`** (aparece en la web).
- **HTTPS obligatorio**: sin él el navegador no deja usar la cámara.
- **Servidor TURN** (p. ej. coturn): sin él muchas conexiones en 4G fallan.
- **Copia de seguridad** diaria de `data/store.json`.
- **Contratar Veriff** y un servicio de envío de emails (Brevo tiene plan gratuito) y poner sus claves.
- Con muchos usuarios, pasar de `data/store.json` a una base de datos (PostgreSQL, etc.).
