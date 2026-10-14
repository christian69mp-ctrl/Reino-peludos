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
- **Videochat** 1 a 1 con WebRTC: Empezar, Siguiente (o tecla Esc), Parar y chat de texto.
- **Premium 19,99 €** para elegir a quién ver (mujeres, hombres, transexuales o parejas). Va ligado
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
- **Páginas legales**: `/normas`, `/terminos` y `/privacidad`.

## Estructura

- `server.js` — servidor web y Socket.IO: emparejamiento, señalización WebRTC, chat y denuncias.
- `auth.js` — registro, inicio de sesión y sesiones.
- `payments.js` — pagos Premium con Segpay (tarjeta, Google Pay, Apple Pay y cripto).
- `moderation.js` — denuncias, suspensiones automáticas y API del panel de moderación.
- `store.js` — guarda usuarios, pedidos y denuncias en `data/store.json`.
- `tokens.js` — firma de las sesiones.
- `public/` — la web: `index.html` (portada + chat), `app.js`, `style.css`, `admin.html`,
  páginas legales y `logo.svg`.

## Variables del servidor

```bash
ADMIN_PASSWORD=...            # contraseña del panel /admin (sin ella el panel está desactivado)
SESSION_SECRET=...            # frase larga y secreta; mantiene las sesiones tras reiniciar
BASE_URL=https://laruletacaliente.com

# Pagos (sin ellas, modo demo)
SEGPAY_ETICKET_CARD=123456:7890
SEGPAY_ETICKET_CRYPTO=123456:7891
SEGPAY_POSTBACK_KEY=...
# SEGPAY_CANCEL_URL=https://cs.segpay.com

# Vídeo en redes móviles
TURN_URL=turn:turn.tudominio.com:3478
TURN_USER=...
TURN_PASS=...

# DATA_FILE=/ruta/store.json  # por defecto videochat/data/store.json
```

## Pagos (Segpay)

En la ventana Premium el usuario elige cómo pagar. Los dos métodos se cobran con Segpay:

| Botón | Paquete de Segpay | Cómo se cobra |
|---|---|---|
| Tarjeta · Google Pay · Apple Pay | `SEGPAY_ETICKET_CARD` | 19,99 € cada 30 días, se renueva solo |
| Criptomonedas | `SEGPAY_ETICKET_CRYPTO` | 19,99 € una vez = 30 días (Segpay no permite cripto recurrente) |

Para pagar hay que tener la sesión iniciada; el Premium queda en la cuenta.

### Qué configurar en el Merchant Portal de Segpay

1. **Dos payment packages** (o los que te prepare tu comercial de Segpay):
   - Tarjeta: precio inicial 19,99 € por 30 días y renovación de 19,99 € cada 30 días.
     Pide que activen **Google Pay y Apple Pay** en ese paquete.
   - Cripto: 19,99 € por 30 días sin renovación. Pide que activen **cripto** en la cuenta y en el paquete.
   De cada paquete copia su `x-eticketid` (formato `paquete:precio`, p. ej. `123456:7890`).
2. **Postbacks** (My Websites → Manage Postbacks), con "Use SSL" y respuesta esperada `OK`:
   - **Trans Post**:
     `laruletacaliente.com/api/segpay/postback?key=TU_CLAVE&action=<action>&stage=<stage>&approved=<approved>&trantype=<trantype>&purchaseid=<purchaseid>&orderid=<extra orderid>&iint=<iint>&rint=<rint>`
   - **Disable**:
     `laruletacaliente.com/api/segpay/postback?key=TU_CLAVE&type=disable&purchaseid=<purchaseid>`
   - Activa "Retry postback" para que Segpay reintente si el servidor no responde.

## Antes de abrir al público

- **Completa las páginas legales**: en `/terminos` y `/privacidad` hay datos marcados en amarillo
  (titular, NIF, dirección…). Revísalas con un abogado.
- **Crea el buzón `soporte@laruletacaliente.com`** (aparece en la web).
- **HTTPS obligatorio**: sin él el navegador no deja usar la cámara.
- **Servidor TURN** (p. ej. coturn): sin él muchas conexiones en 4G fallan.
- **Copia de seguridad** diaria de `data/store.json`.
- **Verificación de edad real** con un proveedor externo (las leyes de la UE, Reino Unido y varios
  estados de EE. UU. lo exigen para webs de adultos, y Segpay lo pedirá).
- **Recuperar contraseña por email**: ahora se pide escribiendo a soporte; falta conectar un
  servicio de envío de emails.
- Con muchos usuarios, pasar de `data/store.json` a una base de datos (PostgreSQL, etc.).
