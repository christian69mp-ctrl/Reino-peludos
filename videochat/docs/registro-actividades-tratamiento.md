# Registro de actividades de tratamiento (RAT)

*Art. 30 del RGPD. Borrador interno. Última revisión: octubre 2026.*

## Responsable del tratamiento

| | |
|---|---|
| Nombre | **[Tu nombre y apellidos]** (persona física, hasta que te des de alta como autónomo o crees una empresa) |
| NIF | **[Tu DNI/NIF]** |
| Dirección de contacto | **[Dirección a efectos de notificaciones]** |
| Email de privacidad | soporte@laruletacaliente.com |
| Delegado de Protección de Datos | No designado (revisar con un abogado si el volumen de usuarios crece: tratamiento a gran escala de datos sensibles puede obligar a tenerlo, art. 37 RGPD). |

---

## 1. Cuentas de usuario

| | |
|---|---|
| **Finalidad** | Crear y mantener la cuenta, iniciar sesión, recuperar la contraseña, confirmar el email. |
| **Base jurídica** | Ejecución del contrato (art. 6.1.b), es decir, las condiciones de uso aceptadas al registrarse. |
| **Interesados** | Usuarios registrados (mayores de 18 años). |
| **Datos** | Email; contraseña cifrada (scrypt, no se puede leer); "qué eres" (mujer, hombre, trans o pareja); idioma; fecha de alta y de aceptación de las condiciones; si el email está confirmado; contadores de 👍/❤️ recibidos; lista de personas bloqueadas. |
| **Datos sensibles** | "Trans" y el propio uso de un videochat para adultos pueden revelar orientación sexual o vida sexual (art. 9 RGPD). **Pendiente:** consultar si hace falta un consentimiento explícito aparte al registrarse. |
| **Plazo** | Mientras exista la cuenta. Se borra al eliminarla (botón "Borrar mi cuenta"). |
| **Destinatarios** | Proveedor de email (Brevo) solo para enviar los mensajes. Proveedor del servidor (alojamiento). |
| **Transferencias internacionales** | No, si el servidor y Brevo están en la UE. |

## 2. Seguridad y prevención de abusos

| | |
|---|---|
| **Finalidad** | Evitar registros masivos con bots, ataques a contraseñas y fraude. |
| **Base jurídica** | Interés legítimo (art. 6.1.f): proteger la web y a sus usuarios. |
| **Datos** | IP de registro; IP y email en contadores de intentos (solo en memoria, 15 minutos); verificación anti-bots de Cloudflare Turnstile; registros técnicos del servidor. |
| **Plazo** | IP de registro: **90 días** (se borra sola). Contadores: 15 minutos, no se guardan. Registros del servidor: rotación automática (máx. 30 MB por servicio). |
| **Destinatarios** | Cloudflare (Turnstile) como encargado. |
| **Transferencias internacionales** | Cloudflare (EE. UU.): adherido al EU-US Data Privacy Framework. **Comprobar** que sigue vigente al abrir. |

## 3. Verificación de edad

| | |
|---|---|
| **Finalidad** | Garantizar que solo usan el videochat personas mayores de 18 años. |
| **Base jurídica** | Obligación legal y de protección de menores, más interés legítimo (art. 6.1.c y 6.1.f). **Revisar con abogado** cuál aplica en cada país. |
| **Datos que trata Veriff** | Foto del documento de identidad y selfie (biometría para comparar caras). **No llegan a nuestro servidor.** |
| **Datos que guardamos** | Solo el estado (aprobado, pendiente, rechazado o menor de edad), el identificador de la sesión de Veriff y las fechas. **No guardamos el documento ni la fecha de nacimiento.** |
| **Plazo** | Mientras exista la cuenta. |
| **Destinatarios** | Veriff (Estonia, UE), como encargado. Firmar su contrato de encargo (DPA). |
| **Decisiones automatizadas** | Sí: si Veriff indica que es menor, la cuenta se expulsa automáticamente (art. 22). La persona puede reclamar a soporte para una revisión humana. |

## 4. Videochat y mensajes

| | |
|---|---|
| **Finalidad** | Poner en contacto a dos personas al azar (o con filtro) por vídeo y chat. |
| **Base jurídica** | Ejecución del contrato (art. 6.1.b). |
| **Datos** | Imagen y voz en directo; mensajes de chat. |
| **Cómo se trata** | El vídeo va cifrado de extremo a extremo (WebRTC DTLS-SRTP). Por defecto pasa por nuestro servidor TURN para ocultar la IP de cada persona, pero **el servidor no puede verlo ni lo graba**. Los mensajes pasan por el servidor y **no se guardan**. |
| **Plazo** | No se conserva nada, salvo lo indicado en "Denuncias". |
| **Traducción** | Solo si el usuario pulsa "Traducir": el texto de ese mensaje se envía a DeepL (Alemania, UE) como encargado. |
| **Marca de agua** | Cada vídeo lleva un código invisible ligado a la cuenta (no contiene el email) para identificar a quien difunda capturas. |

## 4 bis. Historial de chats, amigos y llamadas

| | |
|---|---|
| **Finalidad** | Que cada usuario vea con quién ha hablado, añada amigos y los llame cuando estén en línea. |
| **Base jurídica** | Ejecución del contrato (art. 6.1.b): son funciones del servicio que el usuario usa voluntariamente. |
| **Datos** | Con quién se ha hablado, fecha, duración y número de veces (sin imágenes ni mensajes); amistades, solicitudes y bloqueos; nombre opcional en el chat; estado en línea (solo en memoria, no se guarda). |
| **Quién lo ve** | El historial, solo su dueño. Los amigos ven el nombre, el género declarado y si está en línea. Cada persona se identifica con un código distinto para cada quien la mira (no se puede cruzar entre cuentas). |
| **Plazo** | Historial: **30 días** (máx. 100 personas). Solicitudes sin responder o rechazadas: 30 días. Amistades: hasta que se quiten o se borre la cuenta. El usuario puede borrar su historial cuando quiera. |
| **Destinatarios** | Ninguno externo. |

## 5. Denuncias y moderación

| | |
|---|---|
| **Finalidad** | Atender denuncias (acoso, burlas, homofobia/transfobia, contenido ilegal, grabación…) y sancionar. |
| **Base jurídica** | Interés legítimo (art. 6.1.f) en mantener la comunidad segura, más la obligación de actuar contra contenido ilegal (Reglamento de Servicios Digitales, DSA). |
| **Datos** | Quién denuncia y a quién; motivo y comentario; **últimos 30 mensajes** de esa conversación como prueba; suspensiones y expulsiones con su motivo; número de intentos de captura de pantalla detectados; huella cifrada (hash) del email de cuentas expulsadas. |
| **Plazo** | Mensajes de prueba: se borran **180 días** después de resolver la denuncia. Hash de expulsados: indefinido, para impedir que vuelvan (revisar proporcionalidad). |
| **Destinatarios** | Solo el administrador. Autoridades si hay delito (p. ej. menores). |

## 6. Premium y pagos *(cuando se active Segpay)*

| | |
|---|---|
| **Finalidad** | Cobrar la suscripción y activar los filtros. |
| **Base jurídica** | Ejecución del contrato (art. 6.1.b) y obligación legal fiscal (art. 6.1.c). |
| **Datos que guardamos** | Plan, método (tarjeta o cripto), estado, fechas e identificador de compra de Segpay. **Nunca los datos de la tarjeta.** |
| **Plazo** | Lo exigido por la normativa fiscal (en España, en general, 4–6 años: **confirmar con gestor**). Al borrar la cuenta, el pago se conserva sin vincularlo a la persona. |
| **Destinatarios** | Segpay (procesador de pagos; confirmar en su contrato si actúa como encargado o como responsable independiente). |
| **Transferencias internacionales** | Segpay opera desde EE. UU.: revisar las garantías de su contrato. |

## 7. Copias de seguridad

| | |
|---|---|
| **Finalidad** | Poder recuperar la web si falla el servidor. |
| **Base jurídica** | Interés legítimo (art. 6.1.f) y deber de seguridad (art. 32). |
| **Datos** | Copia completa de la base de datos (apartados 1, 2, 3, 4 bis, 5 y 6). |
| **Plazo** | **14 días** en el servidor (rotación automática). Las copias que descargues a tu ordenador: guárdalas cifradas y borra las de más de 14 días. |

---

## Medidas de seguridad (art. 32)

- HTTPS obligatorio con HSTS; cabeceras de seguridad (CSP, Permissions-Policy, etc.).
- Contraseñas con scrypt; sesiones firmadas que se pueden invalidar.
- Límites de intentos contra ataques a contraseñas; anti-bots (Turnstile).
- Email confirmado obligatorio antes de verificar la edad o pagar.
- Vídeo cifrado de extremo a extremo y sin grabar; IP oculta entre usuarios (relay TURN).
- Servidor TURN que no permite llegar a redes internas; credenciales que caducan a las 12 h.
- Panel de administración con contraseña; avisos por email de denuncias urgentes.
- Borrado automático de datos antiguos (IP 90 días, pruebas 180 días); copias rotadas a 14 días.
- Contenedor sin privilegios de administrador; cortafuegos con solo los puertos necesarios.
- Los usuarios pueden descargar sus datos y borrar su cuenta desde la web.

## Encargados del tratamiento: contratos que firmar

| Proveedor | Servicio | ¿DPA firmado? |
|---|---|---|
| [Proveedor del servidor] | Alojamiento | ☐ |
| Brevo | Envío de emails | ☐ |
| Veriff | Verificación de edad | ☐ |
| Cloudflare | Anti-bots (Turnstile) | ☐ |
| DeepL | Traducción (si se activa) | ☐ |
| Segpay | Pagos (cuando se active) | ☐ |

La mayoría lo incluyen en sus condiciones (busca "Data Processing Agreement" o "DPA" en su web);
descarga una copia en PDF y guárdala con este documento.
