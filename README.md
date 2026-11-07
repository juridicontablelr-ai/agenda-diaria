# Power Fit · Agenda Activa

Agenda personal de Power Fit en Bogotá: catálogo de 143 actividades, itinerario diario con anillos de progreso, bitácora de hábitos con racha, semana tipo y calendario por meses con los festivos de Colombia.

## Archivos

| Archivo | Qué hace |
|---|---|
| `index.html` | La app completa, con imágenes y logo incluidos. |
| `api/state.js` | Función de Vercel que guarda tus datos y los sincroniza entre navegadores. |

## Qué trae

- **Catálogo de 200 actividades** en seis nichos, con precios de referencia y fuentes verificadas en noviembre de 2026.
- **Ruleta de la suerte** en la página de inicio: escoge al azar una actividad del catálogo (con filtros de nicho y presupuesto) y la lleva a tu día.
- **Mi día**: itinerario con línea de tiempo, anillos de progreso, bitácora y botón para compartir el plan con emojis por WhatsApp o Instagram.
- **Hábitos editables**: renombra, cambia el ícono, ordena, oculta o agrega hábitos (hay 20 ideas listas) y elige cuántos cuentan para la racha. El historial nunca se borra.
- **Mi semana y Calendario en tiempo real**: todo lo que planeas o marcas en Mi día aparece al instante en la semana y en el calendario, también en tus otros dispositivos.
- **Sin pérdidas al quedarte sin internet**: los cambios que no alcanzan a sincronizar quedan pendientes y se envían solos al reconectar.

## Publicar en Vercel con sincronización

1. **Sube los archivos.** En este repositorio: *Add file → Upload files*, arrastra `index.html` y la carpeta `api` (con `state.js` adentro) y confirma el commit.
2. **Crea el proyecto.** En vercel.com: *Add New → Project*, importa `agenda-diaria`, deja el preset en *Other* y despliega.
3. **Conecta el almacenamiento.** En el proyecto de Vercel: pestaña *Storage → Create Database → Upstash for Redis* (plan gratis) y conéctalo al proyecto. Eso crea las variables `KV_REST_API_URL` y `KV_REST_API_TOKEN`. Si aparecen con otro prefijo, la función también acepta `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`.
4. **Crea tu clave.** *Settings → Environment Variables*: agrega `AGENDA_PIN` con una frase larga que solo tú conozcas (por ejemplo, cuatro palabras al azar). No la escribas en ningún archivo del repositorio.
5. **Vuelve a desplegar.** *Deployments → el último → Redeploy*. Las variables solo se aplican al desplegar.
6. **Conecta cada navegador.** Abre tu enlace `.vercel.app`, toca **Tus datos**, escribe la clave y toca **Conectar este navegador**. Hazlo una vez en cada computador o celular.

La pastilla de estado arriba a la derecha te dice en qué modo estás: *Guardado y sincronizado*, *Escribe tu clave…* o *Falta configurar el almacenamiento en Vercel*.

## Pasar tus datos desde la versión de Claude

1. En la agenda dentro de Claude: **Tus datos → Copiar respaldo**.
2. En tu enlace de Vercel, ya conectado: **Tus datos**, pega el texto en *Pegar respaldo* y toca **Importar y combinar**.

Los días del respaldo reemplazan esos mismos días; lo demás se conserva.

## Cómo funciona

- Cada cambio se guarda al instante en el navegador y en Upstash. Los demás navegadores lo reciben en menos de medio minuto, o apenas vuelves a la pestaña.
- La fecha y la hora salen del reloj de tu dispositivo: el panel *Hoy* y la marca *Ahora* se actualizan cada minuto y la agenda pasa sola al día siguiente a medianoche.
- El calendario va mes a mes sin límite de fechas y calcula los festivos de Colombia de cualquier año (fijos, Ley Emiliani y los que dependen de la Pascua).
- Abierta sin el servidor (por ejemplo, el archivo suelto o GitHub Pages), la agenda funciona igual pero guarda solo en ese navegador.

## Privacidad

- El repositorio es público: cualquiera puede ver el código, pero no tus datos. Tus datos viven en tu base de Upstash y solo se leen o cambian con la clave `AGENDA_PIN`.
- Quien conozca la clave puede leer y cambiar tu agenda. Si necesitas cambiarla, edita `AGENDA_PIN` en Vercel, vuelve a desplegar y conecta de nuevo cada navegador.
