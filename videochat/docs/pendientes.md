# Lista de pendientes · La Ruleta Caliente

Marca cada cosa cuando la hagas. Lo de arriba es lo más urgente.

## 🔴 Ya (cuando puedas, hoy o mañana)

- [ ] **Actualizar el servidor otra vez** (trae el contador de «Visitantes» solo con personas reales):
      `ssh -i "$env:USERPROFILE\.ssh\mojohost.pem" ubuntu@185.94.236.58` → `sudo -i` →
      `cd /opt/reino-peludos/videochat && git pull && docker compose up -d --build && echo "LISTO"`
      Comprobar: abrir laruletacaliente.com/es/chat-madrid.
- [ ] **SaaSHub** (saashub.com → Submit): mismos datos que AlternativeTo (ver `docs/marca/difusion.md`).
- [x] **Instagram – promoción** con «Más visitas al perfil». Reanudar cada día a las 21:00 y pausar a las 24:00.
- [ ] **Instagram – bio**: «Videochat 1 a 1 gratis y sin registro 🌶️ Solo +18 👇» y enlace laruletacaliente.com.

## 🟠 Esta semana

- [x] **Cuenta de X creada.**
- [ ] **X – terminar**: **marcar contenido como sensible**, foto, cabecera, bio, web y publicación fijada con el
      reel de 29 s. Decirle a Claude el @usuario. Después, 1 publicación al día de 21:00 a 23:00
      (las 5 primeras están en `difusion.md`).
- [ ] **Añadir Instagram y X** en AlternativeTo (tu app → editar → redes sociales).
- [ ] **Bing Webmaster Tools** → «Mapas del sitio»: comprobar que está `https://laruletacaliente.com/sitemap.xml`.
- [ ] **Google Search Console** → «Sitemaps»: comprobar que las páginas detectadas suben (hasta ~350).
- [ ] **Generar los Reels 23-25** (y los 10-12 si no los hiciste) con Gemini, publicarlos poco a poco.
- [ ] **Prueba real de videollamada** con un amigo: uno con datos móviles (4G/5G) y otro con wifi.

## 🟡 Cada semana (rutina)

- [ ] **5 emails** a artículos de «alternativas a Omegle» (plantillas en `difusion.md`). Si alguno pide dinero,
      preguntar antes.
- [ ] **Mandar a Claude una captura del «Resumen»** del panel /admin (Altas, Conversaciones, Visitantes).
- [ ] Publicar en Instagram y X (2-3 reels/posts por semana como mínimo).
- [ ] Reddit: solo si ves un hilo donde alguien pregunte por alternativas a Omegle (respuesta modelo en `difusion.md`).

## 🟢 Esperando respuesta

- [ ] **Verotel**: esperar respuesta a las 5 preguntas. Cuando terminen de revisar, **borrar la cuenta de prueba**
      christian69mp+verotel@gmail.com (Mi cuenta → Privacidad → Borrar cuenta).
- [ ] **Segpay**: sin respuesta. Si pasan 10 días, mandar recordatorio (pedir a Claude el texto).
- [ ] **AlternativeTo**: esperar a que aprueben la ficha (pueden tardar semanas).

## 🔵 Antes de que haya mucha gente (importante, sin prisa ahora)

- [x] **Correos de la web (Brevo)**: cuenta, dominio autenticado y SMTP puestos en el servidor.
- [x] **Probar Brevo**: «¿Olvidaste tu contraseña?» funciona y el correo llega a Gmail.
- [ ] **Veriff** (verificación de edad con DNI): para cuando alguien denuncie a un posible menor. Pedir a Claude
      los pasos cuando haya movimiento diario.
- [ ] **Copia de seguridad**: una vez al mes, pedir a Claude cómo descargarla al PC.

## ⚪ Cuando haya movimiento diario (para empezar a ganar dinero)

- [ ] **Darte de alta como autónomo** (o consultar a una gestoría qué conviene).
- [ ] Poner **NIF y dirección** en las páginas legales (pedírselo a Claude).
- [ ] **Activar Premium de pago** (Segpay o Verotel) y quitar `PREMIUM_MODE=free`.
- [ ] **Anuncios**: cuenta en ExoClick y activar huecos en /admin → Publicidad (pedir a Claude el hueco
      «mientras busca»).
- [ ] **Mostrar el contador «en línea»**: /admin → Anuncio → marcar la casilla.
