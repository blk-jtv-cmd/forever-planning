# Bienvenida y cuenta atrás en el resumen

## Cambios visibles

- Añadir una cabecera destacada al comienzo de **Resumen** con el mensaje “Bienvenidos, [nombre] y [nombre]”.
- Usar “Novia” y “Novio” como texto provisional cuando todavía no se hayan guardado ambos nombres.
- Mostrar junto al saludo la cuenta atrás de días hasta la boda, con la fecha escrita de forma legible.
- Adaptar el mensaje según el estado:
  - Sin fecha: invitar a indicar la fecha desde Ajustes.
  - Antes de la boda: “Faltan X días”, usando singular cuando falte uno.
  - El mismo día: “¡Hoy es vuestro gran día!”.
  - Después: recordar cuántos días han pasado desde la celebración.
- Conservar debajo las tarjetas y la lista “Lo siguiente” que ya existen.

## Detalles técnicos

- Calcular los días usando fechas locales normalizadas a medianoche para evitar cambios incorrectos por zona horaria.
- Mantener la estética editorial actual, los colores del diseño y una distribución adaptable a móvil y escritorio.
- Verificar el resultado visualmente en el resumen y comprobar que la aplicación siga funcionando sin errores.
