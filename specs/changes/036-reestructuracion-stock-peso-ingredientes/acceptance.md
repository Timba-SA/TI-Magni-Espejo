# Criterios de Aceptación: Reestructuración de Stock, Peso y Gestión de Inactivos para Ingredientes

Este documento define las condiciones y escenarios necesarios para la verificación y aprobación final de la implementación.

## Escenarios de Aceptación

### Escenario 1: Creación de Ingrediente con Peso
- **Dado** que un administrador abre el formulario de Nuevo Ingrediente,
- **Cuando** ingresa el nombre, costo, stock en unidades, selecciona la unidad de medida "kg" e introduce un peso de `1.5`,
- **Entonces** el ingrediente se guarda exitosamente en la base de datos con `peso = 1.500`.
- **Y** en la tabla se visualiza:
  - Stock Actual: `X u` (en lugar de `X kg`).
  - Peso: `1.500 kg`.
  - Costo Unitario: `$ Y / u`.

### Escenario 2: Visibilidad de Inactivos por Defecto
- **Dado** que existen ingredientes inactivos (`is_active = False` y `deleted_at != None`),
- **Cuando** un administrador accede a la página de Ingredientes,
- **Entonces** el listado principal NO muestra los ingredientes inactivos por defecto.
- **Y** el contador de resultados totales refleja únicamente los ingredientes activos.

### Escenario 3: Mostrar Inactivos con Toggle
- **Dado** que el administrador activa el botón "Mostrar inactivos",
- **Cuando** el listado se refresca,
- **Entonces** aparecen tanto los ingredientes activos como los inactivos.
- **Y** los inactivos se visualizan con:
  - Una opacidad del 60% en su fila.
  - Una etiqueta visible que dice "Inactivo".
  - La opción de "Habilitar" (icono de Play) activa para revertir su estado.

### Escenario 4: Sincronización de Estados (is_active y deleted_at)
- **Dado** un ingrediente activo (`is_active = True`, `deleted_at = None`),
- **Cuando** el administrador hace clic en "Inhabilitar",
- **Entonces** en la base de datos se registra `is_active = False` y `deleted_at` toma la fecha y hora actual del servidor.
- **Cuando** hace clic en "Habilitar" sobre un ingrediente inactivo,
- **Entonces** en la base de datos se registra `is_active = True` y `deleted_at = None`.

### Escenario 5: Exportación Completa a Excel
- **Dado** que existen ingredientes activos e inactivos con sus respectivos pesos,
- **Cuando** el administrador hace clic en "Exportar a Excel",
- **Entonces** el archivo Excel descargado contiene a todos los ingredientes (activos e inactivos).
- **Y** incluye las columnas:
  - Estado: "Activo" o "Inactivo".
  - Peso: El peso con decimales.
  - Fecha de Desactivación: La fecha en que se inhabilitó (en blanco para los activos).
