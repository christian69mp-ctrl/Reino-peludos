# Publicar La Ruleta Caliente en internet (paso a paso)

Esta guía deja la web funcionando en tu propio servidor con HTTPS, vídeo en móviles (TURN) y
copias de seguridad automáticas. No hace falta saber programar: solo copiar y pegar comandos.

**Tiempo:** 1–2 horas la primera vez. **Coste mínimo:** servidor (~5–10 €/mes) + dominio (~10 €/año).

> Premium es **de pago desde el primer día**: antes de abrir hace falta el alta (autónomo o empresa)
> y Segpay (paso 10). Mientras tanto puedes instalar y probarlo todo en **modo DEMO** (sin claves
> de Segpay el pago se simula). No abras al público en modo DEMO. Si algún día quisieras dar
> Premium gratis a todos, existe `PREMIUM_MODE=free`.

---

## 1. Contratar un servidor (VPS)

- Sistema: **Ubuntu 24.04**. Tamaño: **2 CPU, 4 GB RAM** basta para empezar.
- **Dónde:** recomendado **OVHcloud VPS** (Francia). Evita Hetzner y proveedores alemanes (prohíben
  contenido adulto). Comparativa, modelo de email para preguntar y servicios gratuitos en
  [docs/alojamiento-y-servicios.md](docs/alojamiento-y-servicios.md).
- Que tenga **IP pública propia** (los VPS de OVH la dan así).
- Ubicación en la UE (por protección de datos).
- **Tráfico mensual amplio** (p. ej. 20 TB incluidos). Por privacidad, el vídeo pasa por tu
  servidor para que nadie vea la IP de la otra persona: cada videollamada gasta ~1,5 GB por hora.
  Con 20 TB caben unas 13.000 horas de videollamada al mes.
- **Antes de pagar, lee sus condiciones de uso** y confirma que permiten webs para adultos.

Al crearlo te darán una **IP** (p. ej. `203.0.113.10`) y acceso por SSH.

## 2. Comprar el dominio y apuntarlo al servidor

En tu proveedor de dominios (Namecheap, Porkbun, OVH, etc.), en la zona DNS crea:

| Tipo | Nombre | Valor |
|---|---|---|
| A | `@` | la IP del servidor |
| A | `www` | la IP del servidor |

Puede tardar de minutos a unas horas en funcionar. Compruébalo con `ping tudominio.com`.

## 3. Preparar el servidor

Entra por SSH (en Windows puedes usar PowerShell o PuTTY):

```bash
ssh root@IP_DEL_SERVIDOR
```

Y ejecuta:

```bash
# Actualizar e instalar Docker
apt update && apt -y upgrade
curl -fsSL https://get.docker.com | sh

# Cortafuegos: solo lo necesario
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp
ufw allow 3478/tcp
ufw allow 3478/udp
ufw allow 49152:50151/udp
ufw --force enable
```

Si tu proveedor tiene además un "firewall" en su panel web, abre allí los mismos puertos.

## 4. Descargar la web

El repositorio es privado: crea un token en GitHub (Settings → Developer settings →
Personal access tokens → *Fine-grained*, solo lectura de este repositorio) y úsalo como contraseña.

```bash
cd /opt
git clone -b claude/videochat-mvp https://github.com/christian69mp-ctrl/Reino-peludos.git
cd Reino-peludos/videochat
```

## 5. Configurar

```bash
cp .env.example .env
openssl rand -hex 32   # ejecútalo 2 veces: una clave para SESSION_SECRET y otra para TURN_SECRET
nano .env
```

Rellena como mínimo: `DOMAIN`, `ACME_EMAIL`, `SESSION_SECRET`, `ADMIN_PASSWORD`, `ADMIN_EMAIL`,
`TURN_SECRET`. Guarda con `Ctrl+O`, `Enter`, y sal con `Ctrl+X`.

Si falta alguno de los imprescindibles, el arranque se para y te dice cuál.

## 6. Arrancar

```bash
docker compose up -d --build
docker compose logs -f app     # para ver qué pasa (sal con Ctrl+C)
```

Abre `https://tudominio.com`. El certificado HTTPS se crea solo en el primer minuto.

Comprobaciones:
- `https://tudominio.com/admin` → entra con tu `ADMIN_PASSWORD` y **activa enseguida la
  verificación en dos pasos** (Seguridad → Activar, con Google Authenticator o Authy en el móvil).
- Lee [docs/seguridad-dueno.md](docs/seguridad-dueno.md): lista de seguridad para ti como dueño.
- Haz una prueba con dos móviles, uno con wifi y otro con datos 4G: si se ven, el TURN funciona.

### Cerrar la web con contraseña hasta abrir al público

Mientras no tengas los pagos, la verificación de edad y los emails listos, puedes dejar la web cerrada:
el navegador pedirá usuario (cualquiera) y contraseña antes de mostrar nada, y Google no la indexará.

```bash
cd /opt/reino-peludos/videochat
echo "SITE_PASSWORD=una-clave-para-ti" >> .env
docker compose up -d
```

El día que abras al público, borra la línea `SITE_PASSWORD=…` de `.env` (`nano .env`) y vuelve a
ejecutar `docker compose up -d`.

## 7. Servicios externos (cuentas gratuitas o de pago)

Después de añadir claves al `.env`, aplica los cambios con `docker compose up -d`.

### Emails (imprescindible: confirmar cuenta y recuperar contraseña)
1. Crea cuenta en **Brevo** (gratis, 300 emails/día). Antes, pregúntales por escrito si aceptan una web
   para adultos que solo envía emails de cuenta (alternativas en docs/alojamiento-y-servicios.md).
2. Añade tu dominio y crea en el DNS los registros que te pida (**SPF, DKIM, DMARC**). Sin ellos
   los emails acaban en spam.
3. En *SMTP & API* copia usuario y clave → `SMTP_USER`, `SMTP_PASS`.
4. Prueba: regístrate en la web y comprueba que llega el email de confirmación.

### Protección contra bots (recomendado, gratis)
1. En **Cloudflare** → Turnstile → *Add site* con tu dominio, modo *Managed*.
2. Copia *Site key* y *Secret key* → `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET`.

### Verificación de edad con documento (imprescindible antes de abrir al público)
Al registrarse basta con marcar «Tengo 18 años o más». **Solo** quien sea denunciado como
«Parece menor de edad» (o a quien se lo pidas desde `/admin`) tiene que verificarse con su
documento para seguir. Por eso se usa poco y sale barato, pero hace falta tenerlo: sin Veriff esa
verificación es **simulada** y no sirve para abrir al público.
(Con `AGE_VERIFICATION=all` se pide a todo el mundo antes del primer videochat.)
1. Contrata **Veriff** (veriff.com). Pide precio para "age verification" y cuéntales que es un
   videochat para adultos.
2. Crea una integración; copia *API key* y *Shared secret key* → `VERIFF_API_KEY`, `VERIFF_SECRET`.
3. *Decision webhook URL*: `https://tudominio.com/api/age/webhook`.

### Entrar con Google, Apple o Facebook (recomendado)
Cada botón aparece solo cuando pones sus claves. En los tres, la **URL de redirección** es
`https://tudominio.com/auth/PROVEEDOR/callback` (cambia PROVEEDOR por `google`, `apple` o `facebook`).

**Google** (gratis):
1. Entra en console.cloud.google.com → crea un proyecto.
2. *APIs y servicios → Pantalla de consentimiento de OAuth*: tipo **Externo**, nombre de la app,
   tu email, logo, y los enlaces a `/privacidad` y `/terminos`. Ámbitos: solo `email` y `openid`.
3. *Credenciales → Crear credenciales → ID de cliente de OAuth → Aplicación web*. En
   "URI de redirección autorizados" pon `https://tudominio.com/auth/google/callback`.
4. Copia el ID y el secreto → `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
5. Pulsa **Publicar la app** (si no, solo pueden entrar las cuentas de prueba).

**Apple** (requiere Apple Developer Program, 99 $/año; lo usan sobre todo en iPhone):
1. developer.apple.com → *Certificates, Identifiers & Profiles*.
2. Crea un **App ID** con "Sign in with Apple" activado.
3. Crea un **Services ID** (p. ej. `com.laruletacaliente.web`) → activa Sign in with Apple →
   dominio `tudominio.com` y Return URL `https://tudominio.com/auth/apple/callback`.
   Este Services ID es `APPLE_CLIENT_ID`.
4. *Keys* → crea una clave con Sign in with Apple → descarga el `.p8` (solo se puede una vez).
   El "Key ID" es `APPLE_KEY_ID`; tu "Team ID" (arriba a la derecha) es `APPLE_TEAM_ID`.
5. Copia el `.p8` al servidor (p. ej. `/opt/Reino-peludos/videochat/data/apple.p8`) y pon
   `APPLE_PRIVATE_KEY_FILE=/app/data/apple.p8`, o pega su contenido en `APPLE_PRIVATE_KEY`
   con los saltos de línea como `\n`.
6. Si una persona elige "Ocultar mi email", Apple da un email de reenvío: para que lleguen los
   emails, registra tu dominio de envío en *Services → Sign in with Apple for Email Communication*.

**Facebook** (gratis, pero ojo): developers.facebook.com → crea una app de tipo *Consumidor* →
añade *Inicio de sesión con Facebook* → URI de redirección `https://tudominio.com/auth/facebook/callback`
→ copia App ID y clave secreta → `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`. **Las políticas de Meta
no suelen permitir apps con contenido para adultos**: es posible que rechacen la revisión. Si pasa,
deja sus claves vacías y el botón no aparecerá.

### Traducción del chat (opcional)
**DeepL API Free** (500.000 caracteres/mes) → `DEEPL_API_KEY`.

## 8. Copias de seguridad

La web guarda sola una copia de la base de datos **al arrancar y cada 24 h** (se conservan 14).
Pero si el servidor se rompe, se pierden con él: **descárgalas a tu ordenador cada semana.**

```bash
# En el servidor: hacer una copia ahora y sacarla del contenedor
docker compose exec app npm run -s backup
mkdir -p /root/copias
docker compose cp app:/app/data/copias/. /root/copias/

# En TU ordenador: descargarlas
scp -r root@IP_DEL_SERVIDOR:/root/copias ./copias-la-ruleta
```

Las copias contienen emails de usuarios: guárdalas en un disco o carpeta **cifrada**.

**Restaurar una copia** (por ejemplo `la-ruleta-202610151528.db`):

```bash
docker compose stop app
docker compose run --rm -T --no-deps app sh -c 'rm -f /app/data/la-ruleta.db-wal /app/data/la-ruleta.db-shm && cat > /app/data/la-ruleta.db' < /root/copias/la-ruleta-202610151528.db
docker compose start app
```

## 8 bis. Darte de alta en Google y Bing (posicionamiento)

La web ya genera `https://tudominio.com/sitemap.xml` con todas las páginas en los 6 idiomas.
1. **Google Search Console** (gratis, https://search.google.com/search-console):
   - *Añadir propiedad* → **Dominio** → escribe `tudominio.com` (sin https ni www).
   - Google te da un registro **TXT** (`google-site-verification=…`): añádelo en el DNS de tu
     dominio (en el panel donde lo compraste o en Cloudflare) y pulsa *Verificar*. Puede tardar
     unos minutos.
   - Si prefieres la propiedad *Prefijo de URL* con «Etiqueta HTML», copia solo el valor de
     `content="…"` en `GOOGLE_SITE_VERIFICATION` del `.env` y reinicia (`docker compose up -d`).
   - Menú **Sitemaps** → escribe `sitemap.xml` → *Enviar*. Debe salir «Correcto» con 84 páginas
     (14 páginas × 6 idiomas).
   - En **Inspección de URLs** pide la indexación de la portada `https://tudominio.com/es/` y
     `https://tudominio.com/en/`.
2. **Bing Webmaster Tools** (gratis): puedes importar el sitio desde Search Console (o usar la
   etiqueta en `BING_SITE_VERIFICATION`). Bing también da servicio a DuckDuckGo y Yahoo.
3. Ojo: Google trata las webs para adultos con SafeSearch; es normal que no salgas en búsquedas
   con SafeSearch activado.

## 8 ter. Ganar dinero con publicidad (opcional)

En `/admin` → **Publicidad** tienes tres huecos (portada en ordenador, portada en móvil y lateral del
videochat en pantallas anchas). Dos formas de llenarlos:

1. **Vender tú los banners** a anunciantes (tiendas eróticas, otras webs para adultos…): subes su
   imagen, el enlace y las fechas, y el panel te da impresiones, clics y CTR para enseñárselos.
   No usa cookies. Cobras como quieras (factura, cuando seas autónomo).
2. **Red publicitaria para adultos**: date de alta como *publisher* en **ExoClick**, **TrafficStars**
   o **JuicyAds** (Google AdSense no admite webs para adultos). Crea una zona de cada tamaño
   (160×600, 728×90 y 320×100), copia su código y pégalo en el hueco con el modo «Red publicitaria».
   La web pedirá entonces el consentimiento de cookies antes de cargarla. Antes de darte de alta,
   lee sus condiciones (pagos, datos fiscales que piden y contenido permitido).

## 9. Actualizar la web

Cuando haya cambios nuevos en GitHub:

```bash
cd /opt/Reino-peludos/videochat
git pull
docker compose up -d --build
```

Los datos no se pierden (están en un volumen aparte). La app instalada en los móviles se actualiza sola.

## 10. Activar los pagos (antes de abrir al público)

1. Date de alta (consulta a un gestor: autónomo, epígrafe del IAE, IVA de servicios digitales/OSS).
2. Contrata **Segpay** y configura los paquetes y postbacks como explica el `README.md`.
3. En `.env`: rellena los `SEGPAY_*` (y que no esté `PREMIUM_MODE=free`).
4. Completa en `/terminos` y `/privacidad` tus datos de titular (NIF, dirección…).
5. `docker compose up -d`.

## Problemas frecuentes

| Problema | Solución |
|---|---|
| La web no carga o el candado HTTPS falla | Comprueba que el DNS apunta a la IP (`ping tudominio.com`) y que los puertos 80/443 están abiertos. Mira `docker compose logs caddy`. |
| Se ven por wifi pero no con datos móviles | El TURN no es accesible: revisa los puertos 3478 y 49152–50151/udp (también en el panel del proveedor). `docker compose logs turn`. |
| Servidores con IP privada (AWS, Google Cloud…) | Añade `- --external-ip=IP_PUBLICA/IP_PRIVADA` en `docker-compose.yml`, servicio `turn`. |
| No llegan los emails | Revisa `SMTP_*`, los registros SPF/DKIM y `docker compose logs app`. |
| Te quedas sin tráfico o el servidor va lento con muchas llamadas | Contrata más tráfico, o pon `RELAY_ONLY=off` en `.env` (el vídeo irá directo entre usuarios cuando se pueda, pero cada uno podrá ver la IP del otro). |
| Ver qué está pasando | `docker compose ps` y `docker compose logs --tail=100 app` |
