# Seguridad para ti como dueño de La Ruleta Caliente

Una web para adultos con pagos atrae a gente que intentará entrar en tu panel, robar cuentas,
chantajearte o tumbar la web. Esta lista va de lo más importante a lo menos. Marca cada punto.

## 1. Tus cuentas personales (lo primero que atacan)

- ☐ **Gestor de contraseñas** (Bitwarden es gratis): una contraseña distinta y larga para cada sitio.
  Nunca repitas la del panel, la del servidor o la de tu email.
- ☐ **Verificación en dos pasos (2FA)** con una app (Google Authenticator, Authy, Aegis) en:
  tu email, GitHub, el proveedor del servidor (OVH), el registrador del dominio, Cloudflare,
  Segpay, Brevo y Veriff. Evita el SMS si hay otra opción (se puede robar tu número con un
  duplicado de SIM).
- ☐ Guarda los **códigos de recuperación** de cada 2FA impresos o en el gestor de contraseñas.
- ☐ Usa un **email solo para la web** (no tu email personal) para registrar el dominio, el servidor
  y los proveedores.
- ☐ Activa el **bloqueo del dominio** («domain lock») y la privacidad WHOIS en el registrador.
  Si te roban el dominio, te roban la web.

## 2. El panel /admin

- ☐ `ADMIN_PASSWORD` de 16 caracteres o más, generada por el gestor. Solo en el `.env` del servidor.
- ☐ **Activa la verificación en dos pasos del panel**: `/admin` → Seguridad → Activar → escanea el
  QR con la app del móvil → escribe el código. Desde ese momento hace falta el móvil para entrar.
- ☐ Si pierdes el móvil: en el servidor añade `ADMIN_RESET_2FA=1` al `.env`, ejecuta
  `docker compose up -d`, entra al panel solo con la contraseña, **borra esa línea del `.env`**,
  vuelve a ejecutar `docker compose up -d` y activa de nuevo la verificación con el móvil nuevo.
- ☐ Tras 5 contraseñas fallidas en 15 minutos el panel se bloquea para esa conexión y **te llega un
  email**. Si te llega sin haber sido tú, alguien lo está intentando: cambia la contraseña.
- ☐ Mira de vez en cuando el **registro de actividad** (Seguridad): entradas, entradas fallidas y
  todo lo que se ha hecho (expulsiones, respuestas, anuncios), con fecha e IP.
- ☐ Si crees que alguien ha entrado: «Cerrar todas las sesiones del panel», cambia
  `ADMIN_PASSWORD` y reinicia (`docker compose up -d`).
- ☐ No entres al panel desde ordenadores ajenos ni wifis públicas sin VPN.

## 3. El servidor

- ☐ Entra por SSH **con clave**, no con contraseña:
  ```bash
  # En TU ordenador
  ssh-keygen -t ed25519
  ssh-copy-id root@IP_DEL_SERVIDOR
  # En el servidor, cuando ya entres con la clave:
  sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
  systemctl restart ssh
  ```
- ☐ **Fail2ban** (bloquea a quien prueba contraseñas por SSH): `apt install -y fail2ban`.
- ☐ **Actualizaciones de seguridad automáticas**: `apt install -y unattended-upgrades` y
  `dpkg-reconfigure -plow unattended-upgrades`.
- ☐ El cortafuegos solo con los puertos de DESPLIEGUE.md (paso 3). Nada más abierto.
- ☐ El archivo `.env` **nunca** en GitHub, en capturas ni en mensajes. Permisos: `chmod 600 .env`.
- ☐ Actualiza la web cuando haya cambios (`git pull && docker compose up -d --build`): incluyen
  arreglos de seguridad.

## 4. Copias de seguridad (si no tienes copia, no tienes web)

- ☐ La web hace copia cada 24 h, pero **dentro del servidor**. Descárgalas cada semana a tu
  ordenador (DESPLIEGUE.md, paso 8) y guárdalas **cifradas** (VeraCrypt o la carpeta cifrada del
  sistema): contienen emails de usuarios.
- ☐ Prueba a **restaurar** una copia una vez (en tu ordenador) para saber que funcionan.
- ☐ Guarda también una copia del `.env` en el gestor de contraseñas (sin él no puedes rehacer el
  servidor: las sesiones y los enlaces dependen de `SESSION_SECRET`).

## 5. Ataques a la web

- ☐ **Cloudflare** delante de la web (plan gratis) para frenar ataques de saturación (DDoS).
  Ojo: el vídeo (TURN, puertos 3478 y 49152–50151) no pasa por Cloudflare; el registro DNS
  del TURN debe ser «solo DNS» (nube gris). Pregúntame antes de activarlo y lo dejamos bien.
- ☐ **Turnstile** activado (claves en `.env`): frena bots en el registro, contacto y denuncias.
- ☐ La web ya trae: contraseñas cifradas (scrypt), límites de intentos, cabeceras de seguridad
  (CSP), vídeo que oculta la IP, sesiones que se cierran al cambiar la contraseña y marca de agua
  invisible contra grabaciones.

## 6. Pagos y dinero

- ☐ En Segpay: 2FA, y revisa cada semana los **contracargos** (en el panel: Resumen → Reembolsos y
  contracargos). Muchos contracargos pueden hacer que te cierren la cuenta de pagos.
- ☐ Nunca pidas ni aceptes datos de tarjeta por email o chat: los pagos son siempre en Segpay.
- ☐ Ojo con emails que dicen ser de Segpay, OVH, Google o «la policía» pidiendo que entres en un
  enlace o pagues: **entra siempre escribiendo tú la dirección**, nunca desde el enlace del email.

## 7. Tu privacidad (muy importante en una web para adultos)

- ☐ Mientras puedas, que **tu nombre y dirección no salgan** en la web ni en el WHOIS. Cuando
  seas autónomo o empresa el aviso legal tendrá que llevar tus datos (lo exige la ley): valora
  hacerlo con una sociedad o una dirección profesional (coworking/gestoría) en vez de tu casa.
- ☐ No uses tu cuenta personal de Google, Instagram o WhatsApp para la web. Ten cuentas separadas.
- ☐ Si alguien te amenaza o chantajea: no pagues, guarda pruebas y denúncialo (Policía Nacional /
  Guardia Civil, delitos tecnológicos).

## 8. Moderación y obligaciones legales

- ☐ Revisa **cada día** las bandejas del panel: Denuncias, Avisos DSA (los de menores salen
  marcados como urgentes, y te llegan por email), Recursos y Mensajes.
- ☐ **Cualquier indicio de menores**: expulsa, conserva las pruebas (la web guarda los últimos
  mensajes de la conversación denunciada) y denúncialo a la Policía o a la Guardia Civil. En
  España también puedes avisar al canal prioritario de la AEPD si hay imágenes difundidas.
- ☐ Contesta las peticiones de autoridades que lleguen a `legal@laruletacaliente.com` sin
  demora y solo a direcciones oficiales que puedas comprobar.
- ☐ Usa el **anuncio general** para avisar de mantenimientos o cambios de condiciones.

## 9. Qué hacer si pasa algo (guárdalo)

| Qué pasa | Qué hacer ya |
|---|---|
| Alguien ha entrado en el panel | Cerrar todas las sesiones, cambiar `ADMIN_PASSWORD`, revisar el registro de actividad |
| Te roban la contraseña del email | Recuperarla, cambiar todas las contraseñas que se puedan recuperar desde ese email |
| El servidor está comprometido | Apagarlo, crear uno nuevo, restaurar la última copia buena, cambiar todas las claves del `.env` |
| Fuga de datos de usuarios | Tienes **72 horas** para avisar a la AEPD (sedeagpd.gob.es) y, si es grave, a los usuarios |
| La web va lenta o caída por ataque | Activar Cloudflare en modo «Under Attack» y escribir al proveedor |
| Te piden dinero para no atacarte | No pagar, guardar pruebas, denunciar |
