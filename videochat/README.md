# La Ruleta Caliente

Videochat en vivo 1 a 1 con desconocidos, estilo Chatroulette / CooMeet.

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
- `payments.js` — pagos Premium con Segpay (tarjeta, Google Pay, Apple Pay y cripto).
- `store.js` — guarda los pedidos Premium en `data/store.json`.
- `public/` — cliente (HTML, CSS, JS sin frameworks).

## Pagos (Segpay)

En la ventana Premium el usuario elige cómo pagar. Los dos métodos se cobran con Segpay:

| Botón | Paquete de Segpay | Cómo se cobra |
|---|---|---|
| Tarjeta · Google Pay · Apple Pay | `SEGPAY_ETICKET_CARD` | 19,99 € cada 30 días, se renueva solo |
| Criptomonedas | `SEGPAY_ETICKET_CRYPTO` | 19,99 € una vez = 30 días (Segpay no permite cripto recurrente) |

Sin configurar nada funciona en **modo demo** (se activa Premium sin cobrar).

### Qué configurar en el Merchant Portal de Segpay

1. **Dos payment packages** (o los que te prepare tu comercial de Segpay):
   - Tarjeta: precio inicial 19,99 € por 30 días y renovación de 19,99 € cada 30 días.
     Pide que activen **Google Pay y Apple Pay** en ese paquete.
   - Cripto: 19,99 € por 30 días sin renovación. Pide que activen **cripto** en la cuenta y en el paquete.
   De cada paquete copia su `x-eticketid` (formato `paquete:precio`, p. ej. `123456:7890`).
2. **Postbacks** (My Websites → Manage Postbacks), con "Use SSL" y respuesta esperada `OK`:
   - **Trans Post**:
     `tudominio.com/api/segpay/postback?key=TU_CLAVE&action=<action>&stage=<stage>&approved=<approved>&trantype=<trantype>&purchaseid=<purchaseid>&orderid=<extra orderid>&iint=<iint>&rint=<rint>`
   - **Disable**:
     `tudominio.com/api/segpay/postback?key=TU_CLAVE&type=disable&purchaseid=<purchaseid>`
   - Activa "Retry postback" para que Segpay reintente si el servidor no responde.

### Variables del servidor

```bash
SEGPAY_ETICKET_CARD=123456:7890     # paquete tarjeta / Google Pay / Apple Pay
SEGPAY_ETICKET_CRYPTO=123456:7891   # paquete criptomonedas
SEGPAY_POSTBACK_KEY=una-clave-larga-al-azar   # la misma que pones como key= en los postbacks
SESSION_SECRET=otra-frase-larga-y-secreta
BASE_URL=https://tudominio.com
# SEGPAY_CANCEL_URL=https://cs.segpay.com   # web donde el cliente cancela su suscripción
npm start
```

### Cómo funciona

1. El usuario pulsa un método de pago → el servidor crea un pedido y le manda a la página de
   Segpay con el número de pedido (`orderid`).
2. Segpay avisa al servidor de cada cobro, renovación, reembolso, contracargo o baja, y el
   servidor apunta hasta cuándo dura el Premium. Se guarda en `data/store.json`
   (haz copia de seguridad de ese fichero).
3. El usuario vuelve a la web, que espera la confirmación y activa Premium sola.
4. Cada renovación mensual alarga 30 días más; un reembolso, contracargo o baja lo quita al momento.

## Antes de ponerlo en producción

- **HTTPS obligatorio**: los navegadores solo dan acceso a la cámara en HTTPS (o localhost).
- **Servidor TURN** (p. ej. coturn o un servicio gestionado): sin él muchas conexiones
  detrás de NAT/4G fallan. Configúralo con `TURN_URL`, `TURN_USER` y `TURN_PASS`.
- **Cuentas de usuario**: ahora el Premium queda guardado en el navegador donde se pagó;
  si el usuario cambia de móvil u ordenador no lo recupera.
- **Moderación**: ya no hay botón de reportar, así que no hay forma de que los usuarios
  avisen de abusos (menores, contenido ilegal). Conviene tener alguna alternativa.
- **Moderación**: si la web es de contenido adulto, necesitas verificación de edad real
  (no solo una casilla), moderación de vídeo, términos de uso, política de privacidad y
  cumplir la normativa de tu país (en la UE: DSA y RGPD). Revísalo con un abogado.
