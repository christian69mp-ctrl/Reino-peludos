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
| **Datos** | Email; contraseña cifrada (scrypt, no se puede leer), o el identificador de la cuenta de Google, Apple o Facebook si entra con ellas (solo recibimos email e identificador); "qué eres" (mujer, hombre, trans o pareja); idioma; fecha de alta y de aceptación de las condiciones; si el email está confirmado; contadores de 👍/❤️ recibidos; lista de personas bloqueadas. |
| **Datos sensibles** | "Trans" y el propio uso de un videochat para adultos pueden revelar orientación sexual o vida sexual (art. 9 RGPD). **Pendiente:** consultar si hace falta un consentimiento explícito aparte al registrarse. |
| **Plazo** | Mientras exista la cuenta. Se borra al eliminarla (botón "Borrar mi cuenta"). |
| **Destinatarios** | Proveedor de email (Brevo) solo para enviar los mensajes. Proveedor del servidor (alojamiento). Google, Apple y Meta (Facebook) intervienen como responsables independientes cuando la persona elige entrar con ellos. |
| **Transferencias internacionales** | No, si el servidor y Brevo están en la UE. Google, Apple y Meta: EE. UU. (Data Privacy Framework), solo si la persona elige ese método. |

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
| **Finalidad** | Garantizar que solo usan el videochat personas mayores de 18 años. Al registrarse, la persona declara su mayoría de edad; la verificación con documento solo se pide a cuentas denunciadas como posible menor o a las que el administrador se la pida (o a todas con `AGE_VERIFICATION=all`). |
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

## 4 ter. Fecha de nacimiento y ubicación aproximada (filtros Premium)

| | |
|---|---|
| **Finalidad** | Confirmar la mayoría de edad declarada y permitir los filtros Premium por edad, país y cercanía; mostrar la bandera del país a la otra persona. |
| **Base jurídica** | Ejecución del contrato (art. 6.1.b). |
| **Datos** | Fecha de nacimiento (declarada, no verificada). País, región y coordenadas aproximadas de la ciudad, calculados a partir de la IP con la base de datos DB-IP Lite, que está en nuestro servidor (no se envía la IP a nadie). |
| **Quién lo ve** | La fecha de nacimiento, nadie. La otra persona ve la **edad** y la bandera del país (el administrador también ve la edad). |
| **Plazo** | Fecha de nacimiento: mientras exista la cuenta. Ubicación: **no se guarda**, solo en memoria mientras dura la conexión. |
| **Destinatarios** | Ninguno. |

## 4 bis. Historial de chats, amigos y llamadas

| | |
|---|---|
| **Finalidad** | Que cada usuario vea con quién ha hablado, añada amigos y los llame cuando estén en línea. |
| **Base jurídica** | Ejecución del contrato (art. 6.1.b): son funciones del servicio que el usuario usa voluntariamente. |
| **Datos** | Con quién se ha hablado, fecha, duración y número de veces (sin imágenes ni mensajes); amistades, solicitudes y bloqueos; nombre opcional en el chat; estado en línea (solo en memoria, no se guarda). |
| **Quién lo ve** | El historial, solo su dueño. Los amigos ven el nombre, el género declarado y si está en línea. Cada persona se identifica con un código distinto para cada quien la mira (no se puede cruzar entre cuentas). |
| **Plazo** | Historial: **30 días** (máx. 100 personas). Solicitudes sin responder o rechazadas: 30 días. Amistades: hasta que se quiten o se borre la cuenta. El usuario puede borrar su historial cuando quiera. |
| **Destinatarios** | Ninguno externo. |

## 4 quater. Guindillas, insignias y ranking semanal (gamificación)

| | |
|---|---|
| **Finalidad** | Gestionar los puntos de la web (guindillas), la racha, los retos, las insignias, los superpoderes y el ranking semanal. |
| **Base jurídica** | Ejecución del contrato (art. 6.1.b) para guindillas, racha, retos, insignias y superpoderes. Ranking semanal: interés legítimo en la gamificación del servicio (art. 6.1.f), con derecho de oposición mediante «No aparecer en el ranking». |
| **Datos** | Saldo de guindillas, racha, contadores de actividad, insignias, progreso y guindillas ganadas en la semana, fin de los superpoderes activos y la preferencia `hideRanking`. |
| **Quién lo ve** | Las 3 últimas insignias, la otra persona del chat. Si aparece en el top 10 del ranking semanal, **los demás usuarios ven su nombre en el chat** (o «Anónimo» si no tiene), sus últimas insignias y las guindillas ganadas esa semana. Quien marca «No aparecer en el ranking» deja de mostrarse a los demás en cualquier momento (sigue viendo su propia posición). |
| **Plazo** | Mientras exista la cuenta; se borra con ella y se incluye en «Descargar mis datos». El ranking se reinicia cada semana (lunes a domingo, UTC). |
| **Destinatarios** | Ninguno. |

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
| **Datos** | Copia completa de la base de datos (apartados 1, 2, 3, 4 bis, 5, 6, 8, 9, 10, 11, 12 y 13). |
| **Plazo** | **14 días** en el servidor (rotación automática). Las copias que descargues a tu ordenador: guárdalas cifradas y borra las de más de 14 días. |

## 8. Formulario de contacto (`/contacto`)

| | |
|---|---|
| **Finalidad** | Atender las consultas que llegan por el formulario de contacto y responderlas por email. |
| **Base jurídica** | **Pendiente de confirmar con abogado:** ejecución del contrato (art. 6.1.b) si escribe un usuario sobre su cuenta, o interés legítimo (art. 6.1.f) en atender a quien nos escribe. |
| **Interesados** | Cualquier persona que use el formulario (con o sin cuenta). |
| **Datos** | Nombre (opcional), email, categoría, mensaje e identificador de la cuenta si ha iniciado sesión. La IP solo se usa para limitar el número de envíos; **no se guarda con la consulta**. |
| **Plazo** | **2 años** (730 días) desde que se cierra la consulta; después se borra. |
| **Destinatarios** | Proveedor de email (Brevo) para enviar la respuesta. Proveedor del servidor (alojamiento). |

## 9. Notificaciones de contenido ilegal (`/denunciar-contenido`, art. 16 DSA)

| | |
|---|---|
| **Finalidad** | Recibir y resolver los avisos públicos de contenido presuntamente ilegal, con acuse de recibo y comunicación de la decisión. |
| **Base jurídica** | Obligación legal (art. 6.1.c): Reglamento de Servicios Digitales (DSA), art. 16. |
| **Interesados** | Quien notifica (con o sin cuenta) y las personas o cuentas señaladas en el aviso. |
| **Datos** | Categoría; explicación; URL o código de cuenta; nombre y email de quien notifica (opcionales **solo** en avisos de material de abuso sexual infantil); declaración de buena fe. |
| **Datos sensibles** | La explicación es texto libre y puede incluir datos del art. 9 RGPD o relativos a posibles delitos (art. 10). |
| **Plazo** | **2 años** desde que se cierra el aviso; después se borra. |
| **Destinatarios** | Proveedor de email (Brevo) para el acuse de recibo y la decisión. Autoridades si hay delito (p. ej. menores). |

## 10. Declaración de motivos y recursos contra sanciones (arts. 17 y 20 DSA)

| | |
|---|---|
| **Finalidad** | Informar a la persona del motivo cuando se restringe su cuenta (art. 17) y tramitar los recursos contra sanciones (art. 20). |
| **Base jurídica** | Obligación legal (art. 6.1.c): Reglamento de Servicios Digitales (DSA). |
| **Interesados** | Usuarios con la cuenta restringida. |
| **Datos** | Código del motivo de la restricción, guardado con la cuenta. En los recursos: identificador de la cuenta, texto del recurso y decisión. |
| **Plazo** | Motivo de la restricción: con la cuenta. Recursos: **2 años** desde que se cierran; después se borran. |
| **Destinatarios** | Ninguno externo. |

## 11. Notificaciones push

| | |
|---|---|
| **Finalidad** | Avisar al usuario de llamadas, solicitudes de amistad y amigos en línea aunque tenga la web cerrada. |
| **Base jurídica** | Consentimiento (art. 6.1.a): solo si el usuario las activa y el navegador le pide permiso. Se puede retirar en cualquier momento en "Mi cuenta → Notificaciones" o en el navegador. |
| **Interesados** | Usuarios registrados que activan las notificaciones. |
| **Datos** | Suscripción push del navegador (URL del servicio push del fabricante del navegador y claves de cifrado), vinculada a la cuenta; preferencias de notificación (llamadas, solicitudes de amistad, amigos en línea). |
| **Plazo** | Hasta que el usuario las desactive, el navegador indique que la suscripción ha caducado o se borre la cuenta. |
| **Destinatarios** | El servicio push del fabricante del navegador (p. ej. Google, Mozilla o Apple), por el que pasa cifrado el contenido de cada notificación. |
| **Transferencias internacionales** | Posibles, según el navegador que use la persona (p. ej. Google, Mozilla o Apple, en EE. UU.). **Revisar con abogado** las garantías aplicables. |

## 12. Estadísticas de uso anónimas

| | |
|---|---|
| **Finalidad** | Conocer cómo se usa la web para mejorarla. |
| **Base jurídica** | Interés legítimo (art. 6.1.f). |
| **Interesados** | Visitantes y usuarios de la web. |
| **Datos** | Solo recuentos diarios: páginas vistas, páginas, idiomas, tipo de dispositivo (móvil u ordenador), país (calculado a partir de la IP con la base de datos local; la IP no se guarda), registros por método, conversaciones y su duración, usuarios activos. |
| **Cómo se trata** | Los visitantes únicos se cuentan con un hash de IP + navegador + una sal aleatoria que cambia cada día y se descarta, de modo que no se puede identificar a nadie ni seguirle entre días. **Sin cookies.** |
| **Destinatarios** | Ninguno. |

## 13. Registro de auditoría de la administración

| | |
|---|---|
| **Finalidad** | Dejar constancia de las acciones de moderadores y administradores para detectar abusos o accesos indebidos al panel. |
| **Base jurídica** | Interés legítimo (art. 6.1.f) y deber de seguridad (art. 32). |
| **Interesados** | Moderadores y administradores. |
| **Datos** | Acción realizada, fecha y hora, e IP del administrador. |
| **Plazo** | Solo se conservan las **últimas 500 entradas**; las anteriores se borran. |
| **Destinatarios** | Ninguno externo. |

---

## Medidas de seguridad (art. 32)

- HTTPS obligatorio con HSTS; cabeceras de seguridad (CSP, Permissions-Policy, etc.).
- Contraseñas con scrypt; sesiones firmadas que se pueden invalidar.
- Límites de intentos contra ataques a contraseñas; anti-bots (Turnstile).
- Email confirmado obligatorio antes de verificar la edad o pagar.
- Vídeo cifrado de extremo a extremo y sin grabar; IP oculta entre usuarios (relay TURN).
- Servidor TURN que no permite llegar a redes internas; credenciales que caducan a las 12 h.
- Panel de administración con contraseña; avisos por email de denuncias urgentes.
- Registro de auditoría de las acciones de moderadores y administradores (últimas 500: acción, hora e IP).
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
| Google / Mozilla / Apple | Servicio push del navegador (solo si el usuario activa las notificaciones) | ☐ Revisar si aplica |

La mayoría lo incluyen en sus condiciones (busca "Data Processing Agreement" o "DPA" en su web);
descarga una copia en PDF y guárdala con este documento.
