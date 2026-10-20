# Guía para escribir las páginas de aterrizaje (SEO)

Cada idioma tiene un archivo `seo/content/<idioma>.js`. El servidor (`seo.js`) monta con él páginas
completas (cabecera, migas de pan, llamada a la acción, enlaces relacionados, datos estructurados para
Google, hreflang y sitemap). Aquí solo va el **texto**.

## Formato del archivo

```js
// Páginas de aterrizaje en <idioma> (ver seo/CONTENT-SPEC.md)
module.exports = {
  common: {
    home: 'Inicio',                       // miga de pan
    related: 'También te puede interesar',
    countries: 'Videochat por países',
    topics: 'Más formas de chatear',
    alternatives: 'Alternativas a otras webs',
    faq: 'Preguntas frecuentes',
    ctaTitle: '¿Empezamos?',
    ctaText: 'Crea tu cuenta gratis y conoce a alguien nuevo en segundos.',
    ctaButton: 'Empezar videochat gratis',
    adultNote: 'Solo para mayores de 18 años.',
    disclaimer: '{brand} es una marca de su titular. La Ruleta Caliente no está afiliada a {brand} ni patrocinada por ella; la nombramos solo para comparar.',
    footerTitle: 'Videochat gratis',      // título del bloque de enlaces que se añade al pie de toda la web
  },
  pages: {
    'free-video-chat': {
      slug: 'videochat-gratis',           // dirección: /es/videochat-gratis
      anchor: 'Videochat gratis',         // texto corto para enlaces (2-4 palabras)
      title: 'Videochat gratis con desconocidos · La Ruleta Caliente', // <title>, máx. 60 caracteres
      description: '…',                   // meta description, 140-155 caracteres
      h1: '…',
      intro: '<p>…</p>',                  // 1-2 párrafos
      sections: [ { h2: '…', html: '<p>…</p><ul><li>…</li></ul>' }, … ],  // 3-6 secciones
      faq: [ { q: '…', a: '…' }, … ],     // 3-5 preguntas; respuestas en texto plano (sin HTML)
    },
    …
  },
};
```

- **Todas las claves** de la lista de páginas de tu idioma tienen que estar (ver más abajo).
- **slug**: minúsculas, solo `a-z`, `0-9` y `-`, sin tildes, único en el idioma y **distinto** de las
  direcciones que ya existen (ver «Direcciones ocupadas»).
- **HTML permitido** en `intro` y `sections[].html`: `p, ul, ol, li, strong, em, h3, table, thead, tbody,
  tr, th, td, a`. Nada de estilos, scripts ni imágenes.
- **Enlaces**: solo internos y con esta forma: `<a href="@clave">texto</a>`, donde `clave` es otra página de
  aterrizaje (`@country-mx`, `@alt-omegle`…) o una de estas: `@home`, `@help`, `@how`, `@games`, `@safety`,
  `@rules`. El servidor los convierte en la dirección del idioma. Pon 2-5 enlaces naturales por página.
- Las comillas del código JS: usa comillas simples por fuera y escapa `\'` o usa comillas tipográficas (’ « »).

## Qué es La Ruleta Caliente (datos exactos, no inventes otros)

- Videochat **en vivo 1 a 1, al azar**, con gente de todo el mundo. **Solo mayores de 18**. Gratis para empezar.
- Funciona **en el navegador** del móvil y del ordenador, **sin descargas**; se puede **instalar como app** (PWA).
- Hace falta **cuenta** (email o Google/Apple/Facebook) y confirmar que tienes 18 años o más.
- **Siguiente** (o tecla Esc) para pasar a otra persona; **Parar** para descansar.
- **Chat de texto con traducción automática**; web en 6 idiomas (español, inglés, portugués, francés, alemán, italiano).
- **Reacciones** 👍 ❤️, **añadir amigos**, **cambiar de cámara**, opciones de vista.
- **Juegos durante la llamada**: Verdad o reto, ¿Qué prefieres?, Piedra, papel o tijera y Dibujo y adivina.
  Termómetro de química y temas para romper el hielo. **Modo picante** (juegos y piropos subidos de tono,
  solo con quien también lo tenga activado).
- **Guindillas** 🌶️ (puntos gratis): por entrar cada día (racha), jugar, recibir ❤️ y completar retos semanales.
  **Hora caliente**: cada noche de 22:00 a 23:00 (hora de España) valen el doble. **Insignias** y
  **ranking semanal**: el lunes, los 3 primeros ganan Premium (7, 3 y 1 día).
- **Superpoderes** que se activan con guindillas: Llama caliente (prioridad en la cola), Rebobinar (volver con la
  persona anterior si acepta), Supersaludo, Incógnito y Segunda oportunidad.
- **Premium** (7,99 €/semana o 19,99 €/mes; se cancela cuando quieras): elegir a quién ver (mujeres, hombres,
  trans o parejas), filtros por país, cercanía y edad, sin anuncios, historial de 30 días, amigos y llamadas,
  juegos y piropos picantes, superpoderes gratis cada día.
- **Invita a un amigo**: cuando tu amigo se registra con tu enlace y tiene su primera conversación de más de un
  minuto, **los dos ganáis 1 día de Premium**.
- **Privacidad y seguridad**: el vídeo pasa por nuestro servidor, así **nadie ve tu IP**; **marca de agua**
  invisible contra grabaciones; aviso de que grabar está prohibido; **denunciar** con revisión humana, expulsiones,
  recursos (DSA); normas de la comunidad; página de consejos de seguridad (sextorsión, estafas, menores).
- **No digas** que hay app en Google Play / App Store, ni monedas, propinas o pagos entre usuarios, ni cifras de
  usuarios o países, ni que es «el mejor», «número 1» ni nada que no se pueda comprobar.

## Las otras webs (páginas «alternativa a…»)

Reglas: **nada de afirmaciones sobre precios, funciones o fallos de las otras webs** (no las podemos comprobar y
pueden cambiar), **sin despreciarlas**, sin dar a entender que somos ellas o que tenemos relación. El enfoque es:
«si buscas algo como X, esto es lo que encontrarás aquí». Solo estos hechos públicos se pueden usar:
- **Omegle**: cerró en **noviembre de 2023**; mucha gente busca desde entonces una alternativa.
- **Chatroulette**: una de las primeras webs de videochat aleatorio (2009).
- **DirtyRoulette**, **CooMeet**, **OmeTV**, **Chatrandom**: webs de videochat aleatorio; no digas nada más concreto.
Cada página «alternativa» incluye una tabla `Lo que encuentras en La Ruleta Caliente` (característica → ✓/detalle)
sobre **nuestra** web, no una comparación punto por punto con la otra.
El aviso de marca lo añade el servidor; no lo repitas.

## Páginas de países

Contenido **realmente local**, no plantilla con el país cambiado: cómo se dice/qué se busca allí (p. ej. «videollamada»,
«chat cam»), el idioma o idiomas del país y que el chat traduce, conocer gente del propio país con el filtro
«Mi país» (Premium) o del resto del mundo, la **Hora caliente** a las 22:00 **hora de España** (no conviertas
horas: di «hora de España»), pagos en euros (en países sin euro, el banco convierte la moneda), consejos de
seguridad. Sin estereotipos ni afirmaciones sobre la gente del país. Sin leyes locales concretas.

## Estilo y calidad (lo que mira Google)

- **450-750 palabras** por página (sin contar la FAQ), útiles y diferentes entre sí: nada de párrafos copiados
  entre páginas. Cada página responde a **su búsqueda**: el H1 y el primer párrafo dicen claramente qué ofrece.
- Palabra clave principal en `title`, `h1`, primer párrafo y algún `h2`, de forma natural (sin repetirla en exceso).
- Lenguaje **cercano** de La Ruleta Caliente (tú/du/tu…), con algún emoji como en la web (🌶️), sin pasarse.
- **Apto para todos los buscadores**: nada sexual explícito; «picante», «coqueteo», «para adultos» sí.
- Recuerda en cada página que es **solo para mayores de 18** y algún consejo de seguridad breve.
- `title` ≤ 60 caracteres, termina en ` · La Ruleta Caliente` si cabe; `description` 140-155 caracteres.
- FAQ: preguntas que la gente busca de verdad («¿Es gratis?», «¿Hay que registrarse?», «¿Funciona en el móvil?»…),
  respuestas de 1-3 frases, distintas en cada página.

## Lista de páginas (claves)

Todas los idiomas: `free-video-chat` (índice principal: videochat gratis), `random-video-chat` (videochat / chat
aleatorio, ruleta de videochat), `adult-video-chat` (videochat para adultos +18), `talk-to-strangers` (hablar con
desconocidos), `video-chat-women` (videochat con chicas/mujeres — el filtro es Premium; también hombres, trans y
parejas), `mobile-video-chat` (videochat desde el móvil, sin app que descargar), `alternatives` (índice de
alternativas), `alt-omegle`, `alt-chatroulette`, `alt-dirtyroulette`, `alt-coomeet`, `alt-ometv`, `alt-chatrandom`.

Países (`country-xx`), según el idioma:
- es: `country-es` España, `country-mx` México, `country-ar` Argentina, `country-co` Colombia, `country-cl` Chile,
  `country-pe` Perú, `country-ve` Venezuela, `country-ec` Ecuador
- en: `country-us` United States, `country-gb` United Kingdom, `country-ca` Canada, `country-au` Australia,
  `country-ie` Ireland, `country-nz` New Zealand
- pt: `country-br` Brasil, `country-pt` Portugal
- fr: `country-fr` France, `country-be` Belgique, `country-ch` Suisse, `country-ca` Canada (Québec)
- de: `country-de` Deutschland, `country-at` Österreich, `country-ch` Schweiz
- it: `country-it` Italia, `country-ch` Svizzera

## Direcciones ocupadas (no uses estos slugs)

- es: ayuda contacto normas terminos privacidad aviso-legal reembolsos denunciar-contenido cookies juegos como-funciona seguridad sobre-nosotros
- en: help contact rules terms privacy legal-notice refunds report-content cookies games how-it-works safety about
- pt: ajuda contato regras termos privacidade aviso-legal reembolsos denunciar-conteudo cookies jogos como-funciona seguranca sobre-nos
- fr: aide contact regles conditions confidentialite mentions-legales remboursements signaler-contenu cookies jeux comment-ca-marche securite a-propos
- de: hilfe kontakt regeln agb datenschutz impressum erstattungen inhalte-melden cookies spiele so-funktionierts sicherheit ueber-uns
- it: aiuto contatti regole termini privacy note-legali rimborsi segnala-contenuti cookie giochi come-funziona sicurezza chi-siamo

## Comprobar el archivo

```bash
node seo/check-content.js <idioma>
```
