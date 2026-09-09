# Presupuesto completo

Rehacer la pestaña "Presupuesto" del panel para que sea la herramienta principal de control de gasto de la pareja.

## Cabecera de totales

Tres cifras grandes arriba:
- **Total disponible**: el presupuesto que la pareja ha fijado en Ajustes (editable también desde aquí).
- **Total estimado**: suma de todo lo previsto en las partidas.
- **Diferencia**: disponible menos estimado, en verde si sobra y en rojo si se pasa.

## Categorías

Vienen ya creadas: Lugar y Catering, Fotografía y vídeo, Música y DJ, Flores, Decoración, Vestido y traje, Belleza, Anillos, Invitaciones y papelería, Transporte, Otros.

La pareja puede añadir sus propias categorías con un botón "Nueva categoría", y borrarlas si no tienen gastos dentro. Las categorías creadas se guardan y siguen ahí al volver a entrar.

## Partidas dentro de cada categoría

Las partidas se agrupan por categoría (cada bloque plegable con su subtotal). Columnas:

| Concepto | Categoría | Previsto | Gasto real | Pagado | Pendiente | % del total |

- Pendiente se calcula solo: gasto real menos pagado.
- % del total: peso del gasto real de esa línea sobre el total estimado.
- Se puede añadir una línea dentro de cada categoría, editar los importes directamente en la tabla y borrarla.
- Cada bloque de categoría muestra su fila de subtotales.

## Gráfico Pagado vs Pendiente

Debajo de la tabla, dos visuales con la estética de la web (tonos arcilla y lino):
- Un anillo (donut) con la proporción pagado / pendiente y la cifra total en el centro.
- Barras horizontales por categoría mostrando la parte pagada y la pendiente, ordenadas de mayor a menor gasto.

## Detalles técnicos

- Migración de base de datos: añadir `actual_cost` (numeric, por defecto 0) a `expenses`; nueva tabla `expense_categories` (wedding_id, user_id, name, sort_order) con GRANTs y RLS por `auth.uid()`, más las categorías por defecto insertadas al crear la boda.
- Las categorías mostradas = las de la tabla, unidas a las que ya aparezcan en gastos existentes.
- Gráficos con `recharts`, ya presente en el proyecto; colores desde los tokens del tema, sin colores fijos.
- Se actualiza también la tarjeta de Resumen para reflejar disponible/estimado/diferencia.
