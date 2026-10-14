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
- `payments.js` — suscripción Premium con Stripe (o modo demo).
- `public/` — cliente (HTML, CSS, JS sin frameworks).

## Pagos

Sin configurar nada funciona en **modo demo**: el botón «Suscribirme» activa Premium
sin cobrar, para poder probarlo. Para cobrar de verdad con Stripe:

```bash
STRIPE_SECRET_KEY=sk_live_...   # o sk_test_... para pruebas
SESSION_SECRET=una-frase-larga-y-secreta   # mantiene válidos los accesos tras reiniciar
BASE_URL=https://tudominio.com
npm start
```

El usuario paga en la página de Stripe, vuelve a la web y queda como Premium en ese
navegador. Con el botón «⭐ Premium» abre el portal de Stripe para cancelar.
(Activa el *Customer portal* en el panel de Stripe.)

**Importante:** Stripe no admite negocios de contenido adulto. Si la web es para adultos
hay que usar una pasarela especializada (CCBill, Segpay, Verotel…); el cobro está
aislado en `payments.js` para poder cambiarlo.

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
