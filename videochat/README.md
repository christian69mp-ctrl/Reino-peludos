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

- Aviso de mayoría de edad (+18) antes de entrar.
- Emparejamiento aleatorio con cola de espera (sin repetir la última pareja al instante).
- Vídeo y audio P2P con WebRTC; el servidor solo hace de señalización (Socket.IO).
- Botones Empezar / Siguiente (o tecla Esc) / Parar.
- Chat de texto con la pareja actual.
- Botón Reportar: con 3 reportes se bloquea la IP (en memoria).
- Contador de usuarios conectados.

## Estructura

- `server.js` — Express + Socket.IO: cola, emparejamiento, reenvío de señales, reportes.
- `public/` — cliente (HTML, CSS, JS sin frameworks).

## Antes de ponerlo en producción

- **HTTPS obligatorio**: los navegadores solo dan acceso a la cámara en HTTPS (o localhost).
- **Servidor TURN** (p. ej. coturn o un servicio gestionado): sin él muchas conexiones
  detrás de NAT/4G fallan. Configúralo con `TURN_URL`, `TURN_USER` y `TURN_PASS`.
- **Base de datos** para reportes y bloqueos (ahora se pierden al reiniciar).
- **Moderación**: si la web es de contenido adulto, necesitas verificación de edad real
  (no solo una casilla), moderación de vídeo, términos de uso, política de privacidad y
  cumplir la normativa de tu país (en la UE: DSA y RGPD). Revísalo con un abogado.
