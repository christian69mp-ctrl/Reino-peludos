# Videochat Aleatorio (MVP)

Videochat 1 a 1 con desconocidos al azar, estilo Chatroulette / CooMeet.

## Cómo arrancarlo

```bash
cd videochat
npm install
npm start          # http://localhost:3000
```

Abre dos pestañas (o dos navegadores) y pulsa «Empezar» en ambas para probarlo.

## Qué incluye

- Entrada con aviso de mayoría de edad (+18) y elección de lo que eres (mujer, hombre, transexual o pareja).
- Emparejamiento aleatorio con cola de espera (sin repetir la última pareja al instante).
- Vídeo y audio P2P con WebRTC; el servidor solo hace de señalización (Socket.IO).
- Botones Empezar / Siguiente (o tecla Esc) / Parar.
- Chat de texto con la pareja actual.
- **Plan Premium 19,99 €/mes**: permite elegir a quién ver (mujeres, hombres, transexuales o parejas).
  Sin suscripción el emparejamiento es siempre al azar; el servidor ignora el filtro
  si el usuario no ha pagado.
- Contador de usuarios conectados.

## Estructura

- `server.js` — Express + Socket.IO: cola, emparejamiento con filtros, reenvío de señales.
- `payments.js` — pagos Premium: Stripe (tarjeta, Google Pay, Apple Pay) y NOWPayments (cripto).
- `public/` — cliente (HTML, CSS, JS sin frameworks).

## Pagos

En la ventana Premium el usuario elige cómo pagar:

| Método | Proveedor | Cómo se cobra |
|---|---|---|
| Tarjeta, Google Pay, Apple Pay | Stripe Checkout | 19,99 €/mes, se renueva solo |
| Criptomonedas (BTC, ETH, USDT…) | NOWPayments | 19,99 € de una vez = 30 días de Premium |

Sin configurar nada todo funciona en **modo demo** (se activa Premium sin cobrar).
Para cobrar de verdad:

```bash
# Tarjeta / Google Pay / Apple Pay
STRIPE_SECRET_KEY=sk_live_...

# Criptomonedas
NOWPAYMENTS_API_KEY=...          # panel de NOWPayments → API keys
NOWPAYMENTS_IPN_SECRET=...       # panel de NOWPayments → Store settings → IPN secret
# NOWPAYMENTS_SANDBOX=1          # para probar con el entorno de pruebas

SESSION_SECRET=una-frase-larga-y-secreta   # mantiene válidos los accesos tras reiniciar
BASE_URL=https://tudominio.com              # NOWPayments avisa de los pagos a BASE_URL/api/crypto/ipn
npm start
```

- **Google Pay y Apple Pay** aparecen solos en la página de pago de Stripe cuando el
  dispositivo los tiene. Hay que activarlos en el panel de Stripe (Ajustes → Métodos de
  pago) y, para Apple Pay, verificar el dominio.
- Para cancelar la suscripción con tarjeta, el usuario pulsa «⭐ Premium» y se abre el
  portal de Stripe (actívalo en el panel: *Customer portal*). Con cripto, ese botón
  muestra hasta qué día tiene Premium.
- Los pagos cripto tardan unos minutos en confirmarse; al volver a la web, la página
  espera la confirmación sola. Los pedidos pendientes se guardan en memoria: si el
  servidor se reinicia en ese rato, el pago hay que activarlo a mano.

**Importante:** Stripe no admite negocios de contenido adulto. Si la web es para adultos,
la parte de tarjeta/Google Pay/Apple Pay hay que hacerla con una pasarela especializada
(CCBill, Segpay, Verotel…). Confirma con ellas que ofrecen Google Pay y Apple Pay. El
cobro está aislado en `payments.js` para poder cambiarlo.

## Antes de ponerlo en producción

- **HTTPS obligatorio**: los navegadores solo dan acceso a la cámara en HTTPS (o localhost).
- **Servidor TURN** (p. ej. coturn o un servicio gestionado): sin él muchas conexiones
  detrás de NAT/4G fallan. Configúralo con `TURN_URL`, `TURN_USER` y `TURN_PASS`.
- **Cuentas de usuario y base de datos**: ahora la suscripción queda guardada en el
  navegador; si el usuario cambia de móvil u ordenador no la recupera.
- **Moderación**: ya no hay botón de reportar, así que no hay forma de que los usuarios
  avisen de abusos (menores, contenido ilegal). Conviene tener alguna alternativa.
- **Moderación**: si la web es de contenido adulto, necesitas verificación de edad real
  (no solo una casilla), moderación de vídeo, términos de uso, política de privacidad y
  cumplir la normativa de tu país (en la UE: DSA y RGPD). Revísalo con un abogado.
