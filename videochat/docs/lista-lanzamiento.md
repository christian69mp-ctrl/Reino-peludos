# Lista de lanzamiento

Marca cada casilla al terminarla. Está en el orden recomendado.

## Tu situación ahora: sin ser autónomo ni empresa

Puedes **preparar y probar todo** (los pagos, en modo DEMO, que los simula). Como Premium será de
pago desde el primer día, **antes de abrir** tienes que darte de alta (autónomo o, si el gestor lo
ve posible, solo en Hacienda) y contratar Segpay (apartado G).

- Mientras no haya ingresos, en general no hace falta darse de alta. **En cuanto cobres** (Premium,
  publicidad, afiliados…), sí. **Consulta a un gestor antes de abrir al público**, también por
  cómo figurar como titular de la web siendo persona física.
- Aunque no cobres, **eres responsable de los datos** de los usuarios (RGPD): los documentos de esta
  carpeta y las páginas legales tienen que estar completos igualmente.
- Veriff, y más adelante Segpay, son servicios para empresas. Pregunta a Veriff si te dan de alta
  como persona física o si necesitas antes ser autónomo. **Sin verificación de edad real no abras al
  público** (ver más abajo).

---

## A. Antes de nada (gratis o casi)

- ☐ (Recomendado) **Entrar con Google**: crear las claves en Google Cloud (gratis, ver DESPLIEGUE.md).
- ☐ (Opcional) **Entrar con Apple** (99 $/año) y **Facebook** (Meta puede rechazar webs para adultos).

- ☐ Comprar el dominio.
- ☐ Crear el buzón `soporte@tudominio.com` (en la web aparece como contacto).
- ☐ Preguntar por escrito a **Brevo** si acepta la web (ver docs/alojamiento-y-servicios.md); si sí, cuenta con SPF, DKIM y DMARC en el DNS.
- ☐ Preguntar por escrito al **proveedor del servidor** si acepta la web (modelo de email en docs/alojamiento-y-servicios.md).
- ☐ **Cloudflare Turnstile** (anti-bots): site key y secret.
- ☐ (Opcional) **DeepL API Free** para traducir el chat.

## B. Servidor (ver [DESPLIEGUE.md](../DESPLIEGUE.md))

- ☐ VPS en la UE, con condiciones que permitan webs para adultos y tráfico amplio.
- ☐ Docker instalado, cortafuegos con los puertos de la guía.
- ☐ `.env` completo; `docker compose up -d --build`.
- ☐ La web carga con candado HTTPS.
- ☐ Prueba con **dos móviles, uno en wifi y otro con datos**: se ven y se oyen.
- ☐ Prueba completa: registro → email de confirmación → verificación de edad → videochat →
  reacción → denuncia → aparece en `/admin` y te llega el email de aviso.
- ☐ Recuperar contraseña funciona.
- ☐ Instalar la app desde el móvil (Android: botón "Instalar"; iPhone: Compartir → Añadir a inicio).

## C. Legal y privacidad (con abogado)

- ☐ Rellenar los datos marcados en amarillo en `/terminos` y `/privacidad` (**6 idiomas**):
  titular, NIF, dirección, email.
- ☐ Revisar las condiciones y la política de privacidad con un abogado.
- ☐ Completar y revisar [registro-actividades-tratamiento.md](registro-actividades-tratamiento.md).
- ☐ Completar y revisar [evaluacion-impacto.md](evaluacion-impacto.md) (EIPD).
- ☐ Descargar o firmar los **DPA** de: servidor, Brevo, Veriff, Cloudflare (y DeepL si lo usas).
- ☐ Consultar en qué países hay leyes que exijan verificación de edad específica (p. ej. Reino Unido,
  Francia, algunos estados de EE. UU.) y si conviene bloquear alguno al principio.
- ☐ Decidir si "trans", "pareja" y el uso de la web requieren consentimiento explícito (art. 9 RGPD).

## D. Verificación de edad (obligatorio para abrir)

Al registrarse basta con marcar «Tengo 18 años o más»; el documento solo se pide a quien sea
denunciado como posible menor (o a quien se lo pidas en `/admin`). Aun así Veriff tiene que estar
contratado: sin él esa verificación es simulada.

- ☐ Contratar **Veriff** y poner `VERIFF_API_KEY` y `VERIFF_SECRET`.
- ☐ Configurar el webhook `https://tudominio.com/api/age/webhook`.
- ☐ Hacer una verificación real con tu DNI y comprobar que entras al chat.
- ☐ En `docker compose logs app` **no** debe aparecer "la verificación de edad es SIMULADA".

## E. Moderación y procedimientos

- ☐ Saber entrar en `/admin` desde el móvil (guarda la contraseña en un gestor de contraseñas).
- ☐ Revisar denuncias **cada día**; las de menores, en cuanto llegue el email.
- ☐ Procedimiento ante un **menor o contenido ilegal**: expulsar, no difundir nada, conservar lo
  mínimo y denunciar a la Policía Nacional o Guardia Civil.
- ☐ Procedimiento ante una **brecha de seguridad**: valorar, avisar a la AEPD en 72 h si hay riesgo,
  avisar a usuarios si el riesgo es alto, y apuntarlo en un registro de incidentes.
- ☐ Responder emails de soporte (derechos de privacidad: plazo máximo de 1 mes).

## F. Copias de seguridad

- ☐ Comprobar que hay copias en `data/copias` (`docker compose exec app ls data/copias`).
- ☐ Descargar una copia a tu ordenador y guardarla en una carpeta cifrada.
- ☐ **Probar a restaurar** una copia una vez (ver DESPLIEGUE.md), para saber hacerlo con calma.
- ☐ Recordatorio semanal para descargar copias.

## G. Activar los pagos (antes de abrir: Premium de pago desde el primer día)

- ☐ Alta como autónomo o empresa (gestor: IAE, IVA de servicios digitales con ventanilla OSS si
  vendes a otros países de la UE, facturación).
- ☐ Contratar **Segpay**; configurar los 4 paquetes y los postbacks (ver README.md).
- ☐ Actualizar los datos del titular en las páginas legales y el RAT (apartado 6, pagos).
- ☐ En `.env`: sin `PREMIUM_MODE=free` y con los `SEGPAY_*`; `docker compose up -d`.
- ☐ Hacer una compra real de prueba y cancelarla.
- ☐ Mientras no esté Segpay, para probar se puede usar el modo DEMO (sin `SEGPAY_*` ni
  `PREMIUM_MODE=free`): el pago se simula. **No abras al público en modo DEMO.**
- ☐ **Cookies:** la red publicitaria solo se pega en `/admin` → Publicidad (la web ya pide el consentimiento). No añadir por otro lado Google Analytics, píxeles de Meta/TikTok ni vídeos o mapas incrustados de terceros: necesitarían también consentimiento y figurar en `/cookies`.

## H. Abrir al público

- ☐ **Quitar la contraseña de la web**: borrar `SITE_PASSWORD` de `.env` y `docker compose up -d` (DESPLIEGUE.md).
- ☐ **Google Search Console**: verificar el dominio y enviar `sitemap.xml` (DESPLIEGUE.md, paso 8 bis). Lo mismo en Bing Webmaster Tools.
- ☐ Publicar los posts de Instagram (16, prompts en `docs/marca/`) y los 3 anuncios de vídeo.
- ☐ Anunciar en redes las 2 promociones de Premium gratis (invita a un amigo: 1 día para cada uno; premios del ranking: 7 / 3 / 1 días): posts 18-19, prompts en `docs/marca/prompts-instagram-17-19.md` (el post 17, «Todo gratis para empezar», presenta lo que se puede hacer sin pagar; no hay prueba gratis al registrarse).
- ☐ Vigilar los primeros días: `docker compose logs -f app`, denuncias, tráfico del servidor.
- ☐ Revisar el tráfico mensual del servidor la primera semana (el vídeo pasa por él).
