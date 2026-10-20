# Propinas 🪙 y retiradas: guía para el dueño

*Documento interno. Borrador hecho a partir de lo que hace el código (`tips.js`, `public/tips.js`).
**No es asesoramiento legal ni fiscal**: todo lo marcado con ⚖️ hay que confirmarlo con tu gestor o
abogado antes de activar nada.*

---

## 1. Qué hace

- Las personas compran **monedas 🪙** en paquetes (pago único con Segpay):

  | Paquete | Monedas | Precio | Variable del paquete de Segpay |
  |---|---|---|---|
  | Pequeño | 50 | 5,99 € | `SEGPAY_ETICKET_COINS_S` |
  | Mediano | 120 | 12,99 € | `SEGPAY_ETICKET_COINS_M` |
  | Grande | 300 | 29,99 € | `SEGPAY_ETICKET_COINS_L` |

  Sin Segpay configurado (modo DEMO) la compra se **simula** y no se cobra nada.
- **Durante una videollamada**, el botón 🪙 permite dar una propina a la persona con la que se
  habla: 10, 25, 50 o 100 monedas, o cualquier cantidad de 1 a 1.000. Las dos personas ven la
  animación; quien la recibe ve cuánto ha ganado.
- Límites que pone el código:
  - Máximo `TIP_DAILY_MAX` monedas enviadas en 24 horas por persona (por defecto 2.000).
  - Una propina cada 1,5 segundos como mucho.
  - No se pueden dar propinas entre cuentas registradas desde la misma conexión (misma IP de
    registro). Ojo: la IP de registro se borra a los 90 días por privacidad, así que este control
    solo funciona con cuentas recientes.
  - Quien no quiera recibir propinas puede apagar «Aceptar propinas de otras personas» en
    Mi cuenta → Monedero.
  - Las cuentas expulsadas no pueden dar ni recibir propinas.
- **Quien recibe** gana `COIN_VALUE_EUR` por moneda (0,10 € por defecto) menos la comisión de la web
  `TIP_FEE_PCT` (40 % por defecto): **0,06 € por moneda** con los valores por defecto.
- Lo ganado queda **retenido** `TIP_HOLD_DAYS` días (14 por defecto) por si el pago de quien dio la
  propina se devuelve o hay un contracargo. Después pasa a **«Disponible»**.
- **Si una compra de monedas se reembolsa o hay contracargo**: se quitan esas monedas; si ya las
  había gastado, se anulan sus propinas que aún estaban retenidas (las más recientes primero) y esa
  cuenta **ya no puede dar propinas** (queda bloqueada para propinas). Las propinas que ya estaban en
  una retirada o pagadas **no se anulan**: esa pérdida es tuya.
- **Retirar** (solo con `PAYOUTS=on`):
  - A partir de `PAYOUT_MIN_EUR` disponibles (50 € por defecto).
  - Solo con la **identidad verificada con Veriff** (documento + selfie). La pestaña Monedero tiene
    un botón «Verificar mi identidad» que abre Veriff (se pide con el propósito `payout`, aunque a esa
    persona no se le exija verificarse para chatear). Si ya se verificó antes (por ejemplo, por una
    denuncia de «menor»), no se le vuelve a pedir.
  - Tiene que dar: **titular de la cuenta (nombre completo), IBAN, dirección completa, país, NIF o
    número fiscal y fecha de nacimiento**.
  - Una sola solicitud pendiente a la vez. Se pide todo lo disponible en ese momento.
  - **Tú haces la transferencia a mano** y la marcas como pagada en `/admin` → Propinas, con la
    referencia de la transferencia. O la rechazas explicando el motivo (la persona lo ve) y el dinero
    vuelve a «Disponible».
- La nota que se ve al dar propina dice: *«La propina es un regalo voluntario a esta persona y no se
  devuelve. Nunca pagues a cambio de que alguien haga algo en cámara: si te lo piden, denúncialo.»*

Todo está **apagado por defecto**. Si no tocas nada, nadie ve ni el botón 🪙 ni la pestaña Monedero.

## 2. Cómo se activa (`.env`)

```bash
TIPS=on                 # activa monedas y propinas (por defecto: apagado)
PAYOUTS=on              # activa las retiradas (solo funciona con TIPS=on; por defecto: apagado)
TIP_FEE_PCT=40          # comisión de la web en % sobre el valor de la propina (0–90)
COIN_VALUE_EUR=0.10     # lo que vale una moneda para quien la recibe, antes de la comisión
PAYOUT_MIN_EUR=50       # mínimo para pedir una retirada
TIP_HOLD_DAYS=14        # días que queda retenido lo ganado (0–180)
TIP_DAILY_MAX=2000      # máximo de monedas que una persona puede dar en 24 h
SEGPAY_ETICKET_COINS_S=123456:7901   # paquete de 50 monedas (5,99 €)
SEGPAY_ETICKET_COINS_M=123456:7902   # paquete de 120 monedas (12,99 €)
SEGPAY_ETICKET_COINS_L=123456:7903   # paquete de 300 monedas (29,99 €)
```

Después: `docker compose up -d`. En `docker compose logs app` verás
`[propinas] Activadas (comisión …)`. Los precios de los paquetes están en el código (`tips.js`); si
quieres cambiarlos, hay que cambiarlos allí y en Segpay a la vez.

**Consejo:** activa primero solo `TIPS=on` (con `PAYOUTS` apagado). La gente puede dar y recibir
propinas y lo ganado se guarda («Las retiradas se activarán muy pronto»). Así ves cómo se usa antes
de mover dinero hacia fuera. Pero no lo actives en real sin haber hecho la lista del apartado 4:
desde el primer euro cobrado ya estás guardando dinero que debes a otras personas.

## 3. Las cuentas: ¿sale rentable?

Con los valores por defecto, una moneda vale 0,10 € y tú te quedas el 40 % (0,04 €): quien la
recibe gana 0,06 €. Pero de lo que paga el comprador también salen **el IVA** y **la comisión de Segpay**.

Ejemplo **orientativo** suponiendo que el precio lleva un 21 % de IVA incluido (español; depende del
país del comprador y de cómo te diga el gestor que tributan las monedas ⚖️), una comisión de Segpay
**hipotética** del 12 % (la tuya será otra: los procesadores para adultos suelen cobrar bastante más
que un TPV normal, y además puede haber cuotas fijas por operación, reservas y penalizaciones por
contracargo; **mira tu contrato con Segpay**) y que se regalan todas las monedas:

| Paquete | Pagas | Sin IVA | Segpay (12 % hipotético) | Pagas a quien recibe (0,06 €/moneda) | Te queda |
|---|---|---|---|---|---|
| 50 monedas | 5,99 € | 4,95 € | 0,72 € | 3,00 € | **+1,23 €** |
| 120 monedas | 12,99 € | 10,74 € | 1,56 € | 7,20 € | **+1,98 €** |
| 300 monedas | 29,99 € | 24,79 € | 3,60 € | 18,00 € | **+3,19 €** |

Sin contar la comisión de tu banco por cada transferencia, los contracargos ni tu tiempo. Ojo: con una
comisión del 20 % (0,08 €/moneda para quien recibe) los paquetes de 120 y 300 monedas **darían
pérdidas** con estas suposiciones; por eso el valor por defecto es 40 %.

**Antes de abrir, haz esta cuenta con tus números reales** (IVA que te diga el gestor, comisión de
Segpay de tu contrato, coste de cada transferencia) y elige `TIP_FEE_PCT` y `COIN_VALUE_EUR` para
que el paquete grande no pierda dinero. Cambiar la comisión más adelante afecta solo a las propinas
nuevas; avisa antes a los usuarios (es una condición del servicio).

## 4. Lista ANTES de activarlo

Hazla en orden. No actives `TIPS=on` en la web pública hasta tenerla completa.

### a) Gestor / abogado ⚖️

Lleva este documento y pregunta, **por escrito**:

- ☐ **¿Necesito una licencia de pagos?** Cobrar dinero a unos usuarios y pagárselo después a otros
  puede considerarse un servicio de pago o de dinero electrónico (en la UE: directiva de servicios de
  pago PSD2 y de dinero electrónico EMD2; en España, la Ley de servicios de pago y el Banco de
  España). Hay excepciones (por ejemplo, la de **agente comercial** o la de **red limitada**) que
  **pueden aplicarse o no** a este caso. Si no se aplican, haría falta autorización como entidad de
  pago / dinero electrónico o hacer los pagos a través de un proveedor con licencia (algunos
  procesadores ofrecen «payouts» a usuarios). **Esta es la pregunta más importante.**
- ☐ **¿Las monedas son dinero electrónico o un bono?** Cómo se clasifican cambia el IVA y lo anterior.
- ☐ **IVA de la venta de monedas**: ¿se aplica al vender el paquete o cuando se usan? ¿Sobre todo lo
  cobrado o solo sobre tu comisión? (con las reglas de la UE para servicios electrónicos podría ser
  sobre todo). ¿Ventanilla única (OSS) para compradores de otros países? ¿Qué facturas tienes que
  emitir y a quién?
- ☐ **DAC7 (modelo 238)**: las plataformas que pagan a sus usuarios por ciertas actividades deben
  pedirles datos (los que pide el formulario de retirada), comprobarlos y **declararlos cada año a
  Hacienda** (en España, modelo 238, en enero por el año anterior). Pregunta si las propinas entran
  (como «servicios personales» u otra actividad), si tienes que darte de alta como operador de
  plataforma, qué datos y con qué detalle (DAC7 pide importes **por trimestre**, comisiones y número
  de operaciones; el CSV del panel solo da el total anual por persona) y qué pasa con usuarios de
  fuera de la UE.
- ☐ **Lo que ganan los usuarios** tributa en su propia declaración (IRPF u otro impuesto en su país):
  es responsabilidad suya, pero pregunta si **tú** tienes alguna obligación de retención o de
  información además del modelo 238.
- ☐ Revisión de los **textos legales** (términos, privacidad, reembolsos, normas) que ya están
  actualizados en la web, sobre todo: que las monedas no se devuelvan salvo cuando la ley lo exija,
  que se pierdan al borrar la cuenta, la retención y la comisión.
- ☐ **Prevención de blanqueo**: si con el volumen que esperas tienes alguna obligación (identificar,
  conservar documentos, comunicar operaciones sospechosas).
- ☐ **Cuánto tiempo guardar** los datos fiscales y bancarios (en general se habla de unos 6 años por
  la normativa mercantil y fiscal española ⚖️ confirmar).

### b) Segpay

- ☐ Pregunta **por escrito** si aceptan que vendas **monedas / tokens para propinas entre usuarios**
  en una web de **videochat aleatorio para adultos**. Algunos procesadores lo tratan como un modelo de
  negocio distinto (más riesgo) y piden una alta o un contrato aparte.
- ☐ Pregunta qué exigen por las **normas de Mastercard y Visa para webs para adultos en las que los
  usuarios ganan dinero**. En general, estas normas piden **verificar la edad y la identidad de
  cualquier persona que gane dinero o aparezca en el contenido**, **monitorizar el contenido** (en
  directo, con medios para detener lo prohibido), un sistema de denuncias que se atienda rápido y un
  procedimiento de apelación. La web ya verifica con Veriff a quien retira y tiene denuncias, pero
  **pregunta a Segpay qué más necesitan** (por ejemplo, verificar a quien recibe propinas antes de
  recibirlas, no solo al retirar) y apúntalo.
- ☐ Crea **3 paquetes de pago único** (sin renovación): 50 monedas 5,99 €, 120 monedas 12,99 € y
  300 monedas 29,99 €. Copia su `x-eticketid` en `SEGPAY_ETICKET_COINS_S`, `_M` y `_L`.
- ☐ Comprueba que el **postback** (el mismo «Trans Post» que usas para Premium, ver README) está
  activo para esos paquetes: es lo que suma las monedas al pagar y las quita si hay reembolso o
  contracargo.
- ☐ Haz una compra real de cada paquete y un reembolso desde el portal de Segpay: las monedas deben
  aparecer y desaparecer.

### c) Veriff

- ☐ Veriff **real** (con `VERIFF_API_KEY` y `VERIFF_SECRET`), no en modo demo: en modo demo cualquiera
  queda «verificado» al pulsar el botón.
- ☐ Pregunta a Veriff si su servicio cubre este uso (verificar la identidad de quien cobra) y si el
  contrato/DPA lo permite.
- ☐ Haz una retirada de prueba con tu propio documento.

### d) Textos legales

- ☐ Los términos (cláusula 7), privacidad, reembolsos (apartado 11), normas, preguntas frecuentes y
  «Cómo funciona» ya explican las monedas, propinas y retiradas en los 6 idiomas. **Que los revise el
  abogado** y ajusta lo que diga (y las traducciones).
- ☐ Revisa también el [registro de actividades de tratamiento](registro-actividades-tratamiento.md)
  (apartado 6 bis) y añade las propinas a la [evaluación de impacto](evaluacion-impacto.md): se
  tratan datos bancarios, fiscales y de identidad.

### e) Cómo vas a pagar

- ☐ Decide **un día fijo a la semana** para revisar `/admin` → Propinas y hacer las transferencias.
- ☐ Antes de cada transferencia comprueba que **el titular de la cuenta coincide con la identidad
  verificada**: la web solo guarda que la persona está verificada, no su nombre; búscala en el panel
  de Veriff (la sesión lleva el identificador de usuario de la web) y compara el nombre del documento
  con el titular. Si no coincide, **rechaza** la solicitud explicando por qué.
- ☐ Ten claro con el gestor desde qué cuenta pagas (mejor una cuenta de empresa/autónomo solo para
  la web) y cuánto te cobra el banco por transferencia (SEPA a otros países de la UE suele ser barata;
  fuera de la zona SEPA, no).
- ☐ **Guarda dinero para pagar**: el panel muestra «Pendiente de pagar a usuarios». Ese dinero no
  es tuyo; no lo gastes.

### f) Vigilar los abusos

Las propinas con dinero real atraen problemas. Qué mirar y qué hacer:

- **Pedir propinas («mendigar»)**, insistir o presionar → está prohibido en las normas. Si te lo
  denuncian: aviso o suspensión; si se repite, expulsión.
- **Ofrecer o exigir actos sexuales o contenido a cambio de propinas** → prohibido. Expulsión y
  rechazo de las retiradas pendientes.
- **Estafas**: prometer algo a cambio de propinas y no cumplirlo, o pedir pagos fuera de la web.
- **Sextorsión** (amenazar con difundir una grabación si no se paga) → expulsión inmediata,
  conservar los datos y animar a la víctima a denunciar a la Policía; colabora con las autoridades.
- **Blanqueo o fraude con tarjetas**: muchas propinas pequeñas de **cuentas nuevas** a la misma
  persona, cuentas que compran y lo regalan todo enseguida a la misma cuenta, varias cuentas que
  «alimentan» a una, contracargos repetidos, o una retirada justo al acabar la retención. Antes de
  pagar, mira de quién vienen las propinas de esa persona.
- **Qué pasa al expulsar a alguien**: ya no puede dar ni recibir propinas **ni pedir retiradas** (lo
  ganado queda congelado). Si ya tenía una retirada pendiente, en el panel sale «⛔ cuenta expulsada»:
  **recházala** con el motivo (por ejemplo «Cuenta expulsada por incumplir las normas»). Si más adelante
  le levantas la sanción tras un recurso, podrá volver a pedirla.
- Si hay indicios de delito (menores, sextorsión, fraude), no pagues, guarda lo necesario y consulta
  con el abogado antes de hacer nada más.

## 5. Pagar una retirada en `/admin`

1. `/admin` → **Propinas**. Arriba ves si están activadas, la comisión, el valor por moneda, la
   retención y el mínimo, y los totales: monedas vendidas (cobrado), propinas, comisiones de la web,
   pendiente de pagar a usuarios y pagado.
2. Las solicitudes **pendientes** salen primero (el número aparece en la pestaña). Cada una muestra
   importe, titular, email, si la identidad está verificada (✅ o ⚠️), si la cuenta está expulsada
   (⛔), IBAN, NIF, fecha de nacimiento, dirección, país y número de propinas.
3. Comprueba: identidad verificada, titular = persona verificada (en Veriff), cuenta no expulsada,
   propinas que no parezcan fraude.
4. Haz la **transferencia** desde tu banco por el importe exacto.
5. Pulsa **Marcar pagada** y escribe la **referencia de la transferencia** (solo la ve el panel). A la
   persona le llega el aviso y la ve como «Pagada».
6. Si no la pagas, pulsa **Rechazar** y escribe el **motivo** (la persona lo verá). El dinero vuelve a
   «Disponible».

Todo queda en el registro de actividad del panel.

### Exportar para Hacienda (CSV)

En la misma pestaña, elige el **año** y pulsa **Descargar CSV para Hacienda (DAC7)**. Descarga `retiradas-AAAA.csv` con una fila
por persona y las retiradas **pagadas** ese año: usuario, email, titular, NIF, fecha de nacimiento,
dirección, país, IBAN, número de retiradas e importe en euros. Sirve de base para el **modelo 238
(DAC7)**: pásaselo a tu gestor. Recuerda que DAC7 puede pedir el detalle por trimestre y las
comisiones ⚖️; si es así, habrá que ampliar la exportación.

El archivo lleva datos bancarios y fiscales: guárdalo cifrado y bórralo de tu ordenador cuando el
gestor ya no lo necesite.

## 6. Cosas que debes saber del código

- **Borrar la cuenta**: si una persona borra su cuenta, pierde sus monedas y lo que no haya retirado.
  Las propinas y las solicitudes de retirada (con sus datos fiscales y bancarios) **se quedan en la
  base de datos** (por la obligación de conservarlas). No hay borrado automático al pasar el plazo
  legal: cuando el gestor te diga cuánto guardarlas, habrá que añadirlo.
- **«Descargar mis datos»** incluye las compras de monedas, propinas dadas y recibidas y retiradas.
- **El contracargo puede llegar tarde**: los bancos permiten reclamar durante meses. Con 14 días de
  retención, una propina ya pagada no se puede anular. Si ves contracargos, sube `TIP_HOLD_DAYS`
  (por ejemplo a 30 o más).
- Al comprar monedas no se muestra una casilla de aceptación de la pérdida del derecho de
  desistimiento (tampoco en Premium). Pregunta al abogado si hace falta añadirla.
