# Evaluación de Impacto relativa a la Protección de Datos (EIPD): borrador

*Art. 35 del RGPD. Borrador interno para revisar con un profesional. Octubre 2026.*

## 1. ¿Hace falta?

Muy probablemente **sí**. La lista de la AEPD de tratamientos que requieren EIPD incluye, entre otros,
los que cumplen dos o más de estos criterios, y La Ruleta Caliente cumple varios:

- **Datos sensibles o muy personales:** imagen y voz en un contexto íntimo para adultos; posible
  revelación de orientación sexual o identidad ("trans", "parejas").
- **Datos biométricos** para identificar (selfie comparado con el documento en Veriff).
- **Decisiones automatizadas** con efectos (expulsión automática si sale menor de edad; suspensión
  automática por varias denuncias).
- **Personas vulnerables:** riesgo de que intenten entrar menores.
- **Uso de tecnología innovadora** a escala potencialmente grande (videochat aleatorio internacional).

Si tras la evaluación queda un **riesgo alto que no se puede reducir**, hay que consultar a la AEPD
antes de empezar (art. 36).

## 2. Descripción del tratamiento

Videochat 1 a 1 al azar entre adultos, con filtro opcional por género (Premium), chat de texto con
traducción opcional, reacciones, denuncias y moderación. Detalle de datos, plazos y proveedores en
[registro-actividades-tratamiento.md](registro-actividades-tratamiento.md).

**Necesidad y proporcionalidad**
- Solo se pide email, contraseña y "qué eres". Sin nombre, sin foto de perfil, sin teléfono.
- No se graba el vídeo ni se guardan los mensajes (salvo los 30 últimos de una conversación denunciada).
- Veriff no nos pasa el documento ni la fecha de nacimiento: solo "aprobado" o "no".
- Plazos cortos con borrado automático (IP 90 días, pruebas 180 días, copias 14 días).

## 3. Riesgos y medidas

Escala: probabilidad e impacto **B**ajo, **M**edio o **A**lto. "Residual" es el riesgo que queda con las medidas.

| # | Riesgo para las personas | Prob. | Impacto | Medidas aplicadas | Residual |
|---|---|---|---|---|---|
| 1 | **Un menor entra** al videochat | M | A | Verificación con documento y selfie (Veriff) antes de la primera llamada; expulsión automática de menores y aviso al administrador; denuncia "Menor de edad o contenido ilegal" con aviso urgente por email; normas claras. | B–M |
| 2 | **Grabación o captura** del otro sin consentimiento, y difusión | A | A | Marca de agua invisible con código de cuenta para identificar al autor; detección de capturas y aviso a la otra persona; denuncia "me ha grabado"; prohibido en las normas con expulsión. *No se puede impedir del todo* (p. ej. grabar la pantalla con otro móvil): se explica en la web. | M |
| 3 | **Revelar la IP** (y la ubicación aproximada) a un desconocido | A | M | El vídeo pasa por el servidor TURN propio (`RELAY_ONLY`), así nadie ve la IP del otro. | B |
| 4 | **Acoso, insultos, homofobia o transfobia** | A | M | Denuncias con 6 motivos; bloqueo para no volver a coincidir; suspensión automática por varias denuncias; panel de moderación; avisos urgentes por email. | M |
| 5 | **Filtración de la base de datos** (emails, género declarado, denuncias) | B | A | Contraseñas con scrypt; servidor con cortafuegos y contenedor sin privilegios; HTTPS; sin datos de tarjetas ni documentos; borrado automático; copias rotadas. **Pendiente:** cifrar las copias que salgan del servidor. | B–M |
| 6 | **Revelar la orientación o identidad** de alguien (p. ej. que "trans" o "pareja" se haga público) | B | A | El género no se muestra a nadie fuera de la llamada; la cuenta no tiene perfil público; minimización. **Pendiente:** valorar consentimiento explícito (art. 9.2.a). | B–M |
| 7 | **Error de Veriff** que expulse a un adulto | B | M | Revisión humana a petición por soporte; el administrador puede restaurar la cuenta desde el panel. | B |
| 8 | **Suspensión injusta** por denuncias falsas en grupo | M | B | Suspensión temporal, no expulsión; revisión en el panel con los mensajes como prueba. | B |
| 9 | **Robo de cuentas** | M | M | Límites de intentos por email y por IP; recuperación por email confirmado; al recuperar la contraseña se cierran todas las sesiones; botón "cerrar sesión en todos los dispositivos". | B |
| 10 | **Proveedores fuera de la UE** (Cloudflare; Segpay en el futuro) | M | M | Elegir proveedores con garantías (Data Privacy Framework, cláusulas tipo); servidor, Veriff, Brevo y DeepL en la UE. | B |
| 11 | **Mensajes traducidos** enviados a terceros | B | B | Solo al pulsar "Traducir"; DeepL en la UE; solo el texto, sin datos de la cuenta. | B |

## 4. Derechos de las personas

- **Acceso y portabilidad:** botón "Descargar mis datos" (archivo JSON).
- **Supresión:** botón "Borrar mi cuenta"; desaparece de las copias en máximo 14 días.
- **Rectificación, oposición y limitación:** por email a soporte.
- **Decisiones automatizadas:** se puede pedir revisión humana por soporte.
- **Reclamar ante la AEPD:** informado en la política de privacidad.

## 5. Plan de acción pendiente

1. ☐ Abogado: revisar este borrador, la base jurídica de la verificación de edad y la necesidad de
   consentimiento explícito para datos del art. 9.
2. ☐ Firmar o descargar los DPA de todos los proveedores (ver RAT).
3. ☐ Rellenar los datos del responsable en `/terminos` y `/privacidad` (6 idiomas).
4. ☐ Procedimiento escrito para brechas de seguridad: avisar a la AEPD en **72 horas** (sede.aepd.gob.es)
   y a los usuarios si el riesgo es alto.
5. ☐ Procedimiento para menores detectados o contenido ilegal: conservar lo mínimo y denunciar a la
   Policía Nacional o Guardia Civil (siguiendo sus indicaciones).
6. ☐ Revisar esta EIPD cada año o cuando cambie algo importante (pagos, nuevas funciones, más países).

## 6. Conclusión provisional

Con las medidas aplicadas, el riesgo residual se considera **medio-bajo**, siempre que la verificación
de edad con Veriff esté activa en producción. **Sin verificación real (modo demo), el riesgo nº 1
es alto y no se debe abrir al público.**

| | |
|---|---|
| Elaborada por | [Tu nombre] |
| Fecha | [fecha] |
| Revisada por (abogado/DPD) | [nombre, fecha] |
