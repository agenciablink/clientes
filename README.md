# Blink · Espacio de clientes

Panel estático listo para GitHub Pages. Incluye Creative Visual y su grilla de 8 posts y 12 stories, con referencias, copies, objetivos y dirección gráfica.

## Publicar en GitHub Pages

1. Crea un repositorio y sube **el contenido de esta carpeta**, con `index.html` directamente en la raíz. No subas el ZIP sin descomprimir.
2. En el repositorio, abre **Settings → Pages**.
3. En **Build and deployment**, elige **Deploy from a branch**.
4. Selecciona la rama `main`, carpeta `/ (root)` y guarda.
5. Cuando GitHub termine el despliegue, abre la URL que aparece en Pages.

Todas las rutas son relativas, por lo que funciona dentro de un repositorio sin dominio propio. No hay compilación ni dependencias obligatorias. Las fuentes de Google son opcionales y tienen alternativas locales.

## Estructura

- `index.html`: estructura de la interfaz y ventanas.
- `css/estilos.css`: diseño Blink y adaptación móvil.
- `js/app.js`: clientes, filtros, piezas, estados, notas y respaldos.
- `datos/clientes.js`: clientes y grillas incluidos en el sitio.
- `img/creative-visual/`: las 20 referencias visuales.
- `img/favicon.svg`: ícono del sitio.

## Usar el panel

Abre un cliente y luego una pieza. Puedes copiar su texto, consultar su dirección gráfica y guardar estado y notas. “Añadir pieza” permite cargar la planificación de una nueva publicación. Para una imagen nueva, súbela a `img/` en GitHub y coloca su ruta relativa al crear la pieza. Los ejemplos no son fotografías de trabajos reales de Creative Visual y los rótulos de marca son provisionales.

“Nuevo cliente” crea un espacio con sus servicios. Exporta el respaldo JSON después de trabajar y úsalo para recuperar el panel o moverlo a otro navegador. Importar reemplaza el conjunto actual después de confirmar. Las imágenes no se incluyen dentro del respaldo JSON; deben permanecer en la carpeta `img/` del sitio.

Los cambios hechos en la interfaz se guardan en `localStorage` **solo en ese navegador**. No modifican el repositorio ni se sincronizan con otras personas. Para cambiar el contenido inicial que reciben los visitantes, edita `datos/clientes.js` y vuelve a subirlo. Si ese navegador ya tiene datos guardados, puedes importar el respaldo actualizado o borrar específicamente la clave `blink-workspace-v1` de localStorage para cargar otra vez los datos iniciales. Exporta primero los cambios que quieras conservar.

## Alcance y acceso

Esta versión no incluye autenticación ni separación privada de clientes. El enlace directo `#creative-visual` abre su espacio pero no lo protege. Todo el contenido publicado se puede consultar desde los archivos del sitio. No uses esta edición para información confidencial. Los estados son marcas de organización local, no aprobaciones verificadas de otra persona.

Las referencias se descargan en su resolución original generada. Los tamaños de producción indicados son 1080×1350 para posts y 1080×1920 para stories; preparar las piezas finales a esas medidas con el logo original.

## Marca

Paleta azul eléctrico, negro y blanco con textura gráfica y titulares contundentes. El wordmark Blink está compuesto tipográficamente; reemplázalo por el archivo oficial si deseas coincidencia exacta con el logo.

Hecho por Agencia Blink.
