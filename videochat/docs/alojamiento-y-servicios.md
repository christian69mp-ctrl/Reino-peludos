# Dónde alojar la web y qué servicios usar

*Octubre 2026. Las condiciones de los proveedores cambian: confirma siempre por escrito antes de pagar.*

## Por qué cierran webs de adultos (y cómo evitarlo)

Un proveedor puede cortar el servicio si sus condiciones prohíben el contenido para adultos, aunque
sea legal. Lo que juega a tu favor:

- **Tu servidor no guarda vídeos ni fotos.** Es un videochat en directo, cifrado de extremo a extremo,
  que no graba nada. No alojas pornografía: alojas el programa que pone en contacto a dos adultos.
- Tienes normas, denuncias, moderación, expulsión de menores y respuesta rápida a quejas.

Aun así, **pregunta antes de contratar** y guarda la respuesta. Modelo de mensaje (en inglés, que
lo entienden todos):

> Hello, I want to host a live 1-to-1 video chat website for adults (18+), similar to Omegle-style
> random chat. Users may show nudity on camera between consenting adults. The server does not store
> or record any video or images; it only runs the web app and a TURN relay (encrypted WebRTC).
> We have age checks, reporting and moderation. Is this allowed under your terms on a VPS? Thank you.

## Alojamiento (servidor VPS)

Necesitas un **VPS** (servidor virtual), no un "hosting compartido": la web usa Node.js, WebSockets y
un servidor TURN. Busca: Ubuntu 24.04, 2 CPU, 4 GB de RAM, en la UE y con **mucho tráfico incluido**
(el vídeo pasa por tu servidor: ~1,5 GB por hora de videollamada).

| Opción | Dónde | Por qué | Ojo con |
|---|---|---|---|
| **OVHcloud VPS** (recomendado para empezar) | Francia (UE) | Barato, tráfico ilimitado en sus VPS, y en foros de webmasters es de los más citados como aceptables para adultos legales. | Confirma por escrito con su soporte que lo permiten en el VPS concreto. |
| **Proveedores de Países Bajos especializados** (p. ej. Midnight Hosting, Zomro) | Países Bajos (UE) | Se anuncian expresamente como "adult friendly"; la ley holandesa es tolerante con el contenido adulto legal. | Más caros que OVH; compara tráfico incluido. |
| BuyVM | Luxemburgo | Citado en foros como adulto-friendly y barato. | Poca disponibilidad; confirma condiciones. |

**Evita:**
- **Hetzner** y en general **proveedores alemanes**: sus condiciones (apartado 8.2, según copias
  publicadas) prohíben material pornográfico, y Alemania es el país más estricto con el contenido adulto.
- Hosting compartido barato (no sirve para esta web y suele prohibir adultos).
- Proveedores "offshore" que presumen de "ignorar denuncias (DMCA)": atraen problemas y no los necesitas.

## Dominio

Cualquier registrador grande (Porkbun, Namecheap, OVH…) permite dominios de webs legales para adultos.
Un `.com` es lo más sencillo. Activa la protección de privacidad (WHOIS) para que no salgan tus datos.

## Servicios gratuitos que usa la web

| Servicio | Para qué | Coste | ¿Acepta webs de adultos? |
|---|---|---|---|
| **Let's Encrypt** (vía Caddy, ya integrado) | Candado HTTPS | Gratis | Sí, no se necesita cuenta. |
| **coturn** (ya integrado, en tu servidor) | Que el vídeo conecte en 4G y ocultar IPs | Gratis | Es tuyo. |
| **DB-IP Lite** (ya integrado) | País y cercanía por IP | Gratis (CC BY 4.0; el crédito ya está en el pie) | Sí. |
| **Cloudflare Turnstile** | Bloquear bots en el registro | Gratis | No lo prohíbe expresamente; no hace falta poner la web detrás de Cloudflare. |
| **Iniciar sesión con Google** (Google Cloud) | Botón «Continuar con Google» | Gratis | Generalmente sí (otros videochats lo usan); pide solo `email` y `openid`. |
| **Brevo** | Emails de cuenta (confirmar email, recuperar contraseña) | Gratis hasta 300/día | **Dudoso**: sus condiciones restringen ciertos sectores (citas, adultos). Pregúntales por escrito explicando que solo envías emails de cuenta, sin contenido adulto. |
| Alternativas a Brevo: **Mailjet**, **SMTP2GO** | Lo mismo | Tienen plan gratis | Igual: pregunta antes. Si nadie acepta, puedes usar el buzón de tu dominio (muchos registradores lo incluyen) poniendo sus datos SMTP. |
| **DeepL API Free** (opcional) | Traducir mensajes del chat | Gratis hasta 500.000 caracteres/mes | Sí: solo traduce texto. |
| **Facebook Login** (opcional) | Botón «Continuar con Facebook» | Gratis | **Probablemente no**: Meta suele rechazar apps de adultos. |
| **StopNCII.org** y **Canal prioritario de la AEPD** | Para víctimas de grabaciones difundidas | Gratis | Ya están enlazados en las condiciones. |

## Servicios de pago (cuando toque)

| Servicio | Para qué | Coste aproximado |
|---|---|---|
| Servidor VPS | Alojar la web | Desde unos pocos euros al mes |
| Dominio | laruletacaliente.com | ~10–15 €/año |
| **Veriff** | Verificar con DNI a quien denuncien como menor | Se paga por verificación (pide precio) |
| Apple Developer (opcional) | Botón «Continuar con Apple» | 99 $/año |
| **Segpay** (cuando seas autónomo o empresa) | Cobrar Premium | Comisión por venta; especializado en adultos |

## Si te cierran algo

- **Servidor:** guarda copias semanales fuera del servidor (ver DESPLIEGUE.md, paso 8). Con una copia
  y otro VPS, la web vuelve a estar en marcha en menos de una hora.
- **Emails:** con `EMAIL_VERIFICATION=off` la web sigue funcionando sin confirmar emails; quien entre
  con Google no lo necesita.
- **Inicio con Google o Facebook:** si quitan la app, los usuarios siguen pudiendo entrar con
  «¿Olvidaste tu contraseña?», que crea una contraseña para su cuenta.
