# Reino Peludos — Guía de instalación y siguientes pasos

Este tema está construido sobre **Dawn** (el tema base gratuito de Shopify,
OS 2.0), con secciones y estilos propios de marca (`sections/rp-*.liquid`,
`assets/reino.css`, `assets/reino.js`). Todo el código vive en este
repositorio; falta conectarlo a tu tienda real de Shopify, que es algo que
solo puedes hacer tú desde tu propia máquina (requiere iniciar sesión en tu
cuenta de Shopify).

## 1. Requisitos previos

- [Shopify CLI](https://shopify.dev/docs/api/shopify-cli) instalado:
  ```bash
  npm install -g @shopify/cli @shopify/theme
  ```
- Node.js 18 o superior.
- Una tienda de Shopify (de prueba o real). Si todavía no tienes una,
  créala gratis en <https://www.shopify.com/free-trial> (no generamos
  este enlace por ti automáticamente dentro del asistente, pero es el
  registro oficial de Shopify).

## 2. Conectar este tema con tu tienda

Desde la raíz de este repo, en tu terminal local:

```bash
cd Reino-peludos
shopify auth login          # abre el navegador para iniciar sesión
shopify theme dev --store=tu-tienda.myshopify.com
```

`shopify theme dev`:
- Sube este tema como un **tema de desarrollo** (no afecta tu tema publicado).
- Te da una URL de vista previa que se actualiza sola (hot reload) cada vez
  que guardas un cambio.
- Imprime también un enlace al **editor de temas** para ajustar textos,
  imágenes y colores desde la interfaz visual de Shopify.

> Si ya tenías un tema con contenido (colecciones, textos) que quieras
> conservar y fusionar con este, en lugar de `theme dev` puedes primero
> hacer `shopify theme pull --store=tu-tienda.myshopify.com` en una carpeta
> aparte y decirme qué diferencias quieres traer — no lo hice yo mismo
> porque no tengo acceso a las credenciales de tu tienda desde este
> entorno.

### Alternativa sin login interactivo (Theme Access)

Si prefieres darme acceso a mí (al asistente) para trabajar directo contra
tu tienda en futuras sesiones, instala la app gratuita
**[Theme Access](https://apps.shopify.com/theme-access)** en tu tienda,
genera un token y compártemelo (como variable de entorno, nunca en texto
plano en el repo). Con eso puedo correr:

```bash
shopify theme dev --store=tu-tienda.myshopify.com --password=<token>
```

## 3. Publicar cambios

Cuando quieras subir el tema (como borrador, sin publicarlo todavía):

```bash
shopify theme push --unpublished --store=tu-tienda.myshopify.com
```

Y cuando estés listo para publicarlo como tema en vivo, lo haces desde
**Tienda online → Temas** en el admin de Shopify, o con:

```bash
shopify theme push --store=tu-tienda.myshopify.com
# luego, desde el admin: Acciones → Publicar
```

## 4. Qué se hizo en este tema

- **Base:** Dawn (última versión estable) clonado como punto de partida.
- **Paleta de marca** aplicada en `config/settings_data.json` (5 esquemas
  de color): dorado `#D4A84B`, marrón `#3B2A1C`, crema `#F6EDDC`, coral
  `#FF6F5E` como color de botones/CTA.
- **Tipografía:** Fredoka para titulares, Nunito para cuerpo de texto
  (configurado en Ajustes del tema → Tipografía). *Verifica esto en el
  editor:* el selector de fuentes de Shopify no se puede confirmar sin
  conexión a una tienda real, así que si al abrir el tema no aparecen
  exactamente "Fredoka" y "Nunito", vuelve a seleccionarlas manualmente en
  **Editor de temas → Ajustes del tema → Tipografía** (ambas están en el
  catálogo de Google Fonts que ofrece Shopify).
- **Secciones nuevas** (`sections/rp-*.liquid`):
  - `rp-hero.liquid`: banner principal con imagen de fondo, logo, texto y
    2 botones. Sin imagen todavía, cae en un degradado marrón con huellitas
    animadas como fallback.
  - `rp-categories.liquid`: grid de categorías por tipo de mascota, con
    **bloques editables** (icono + nombre + enlace) para que agregues,
    quites o reordenes especies libremente. Vienen 7 precargadas: Perros,
    Gatos, Conejos, Aves, Peces, Hámsters/roedores, Otras mascotas.
  - `rp-story.liquid`: bloque de "producto estrella", reescrito para no
    asumir un producto específico de perro — puedes vincular cualquier
    producto real de tu catálogo y el precio/enlace se completan solos.
  - `snippets/rp-icon.liquid`: iconos SVG propios (perro, gato, conejo,
    ave, pez, roedor, reptil, huella, corona) usados en las secciones de
    arriba.
- **Animaciones y efectos** (`assets/reino.css` + `assets/reino.js`):
  - Aparición progresiva ("scroll reveal") con `IntersectionObserver` en
    hero, categorías y producto estrella, con efecto escalonado.
  - Parallax suave en la imagen del hero al hacer scroll.
  - Huellitas flotantes animadas, hover con elevación en tarjetas de
    categoría, marquee reutilizable (`.rp-marquee`) por si luego quieres
    una franja de marcas/reseñas.
  - Todo respeta `prefers-reduced-motion` (se desactiva si el usuario
    prefiere menos movimiento).
- **Home** (`templates/index.json`): Hero → Categorías → Producto estrella
  → Colección destacada → Newsletter.
- Validado con `shopify theme check`: 0 errores (solo quedan 9 warnings
  preexistentes de Dawn, no de los archivos nuevos).

## 5. Pendiente / lo que necesito que me confirmes o envíes

1. ~~**Logo y banner**~~ ✅ Recibidos e integrados como
   `assets/reino-logo.jpg` y `assets/reino-banner.jpg`. Se usan como
   imagen de fondo del hero, logo del header (izquierda y centrado) y
   favicon, **mientras no subas los mismos archivos como Imágenes de
   marca reales en el editor de temas** (Ajustes del tema → Logo, y en la
   sección "RP · Hero" → Imagen de fondo). El banner que enviaste ya trae
   su propio texto ("Bienvenido al Reino de los Peludos..."), así que
   desactivé el texto superpuesto del hero (`show_overlay_text: false`)
   para no duplicar el mensaje — puedes reactivarlo desde el editor si
   más adelante subes una foto sin texto.
2. **Tienda conectada**: tu URL es `6ixzz2-ht.myshopify.com`. Para que yo
   pueda correr `theme dev`/`theme push` directamente desde aquí (sin que
   tengas que hacerlo tú en tu máquina), instala la app gratuita
   **Theme Access** en esa tienda y compárteme el token — así evitamos el
   login interactivo por navegador que este entorno no puede hacer. Si
   prefieres hacerlo tú mismo localmente, el comando ya queda listo:
   ```bash
   shopify theme dev --store=6ixzz2-ht.myshopify.com
   ```
3. **Menú de navegación y colecciones**: los enlaces de categorías apuntan
   a `/collections/all` de forma temporal. Cuando tengas creadas las
   colecciones por especie (Perros, Gatos, etc.) en el admin, cambio cada
   bloque para que enlace a su colección real.
4. **Producto estrella**: elige qué producto real quieres destacar en
   `rp-story` (o dime cuál accesorio priorizar y preparo el copy final).
5. **Traducción del tema**: Dawn viene en inglés en los textos de sistema
   (carrito, checkout, buscador, etc. — no los de tus secciones, esos ya
   están en español). ¿Quieres que traduzca `locales/en.default.json` a
   español (`locales/es.default.json`), o prefieres usar la app gratuita
   **Translate & Adapt** de Shopify?
6. **Redes sociales / política de envíos / footer**: si tienes Instagram,
   TikTok, etc. o políticas ya redactadas, las conecto en el footer.

Dime qué de esto quieres que resuelva yo directamente en el repo y qué
prefieres hacer tú desde el admin de Shopify.
