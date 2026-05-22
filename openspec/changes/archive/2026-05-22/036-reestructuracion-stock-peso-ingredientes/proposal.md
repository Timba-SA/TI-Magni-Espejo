# Propuesta: Reestructuración de Stock, Peso y Gestión de Inactivos para Ingredientes

Este cambio aborda la necesidad de corregir cómo se administra el inventario de ingredientes en The Food Store. Actualmente, el stock de ingredientes está expresando peso, cuando debería representar unidades físicas de almacenamiento. Para solucionar esto, introduciremos una columna dedicada para el peso unitario y reestructuraremos el comportamiento del stock e ingredientes inactivos.

## Problema

1. **Stock expresa Peso:** El stock actual de los ingredientes mezcla el concepto de cantidad de unidades físicas de insumos con el peso de los mismos, lo cual causa confusión. El stock debe medir cuántas unidades físicas (ej. paquetes, envases, botellas) quedan.
2. **Falta de columna de Peso:** No existe un campo dedicado en el modelo para almacenar el peso unitario de cada unidad del ingrediente, el cual debe expresarse utilizando la unidad de medida real (ej: kg, g, l).
3. **Ingredientes Inactivos visibles por defecto:** Los ingredientes inactivos (`is_active = False`) aparecen mezclados en el listado principal, lo que contamina la visualización administrativa.
4. **Fechas de desactivación desalineadas:** Los ingredientes inactivos no registran una fecha histórica de desactivación (`deleted_at`) similar a los usuarios del sistema.
5. **Reportes incompletos:** El archivo Excel exportado no detalla los ingredientes inactivos ni su peso correspondiente.
6. **Formato visual confuso:** El stock se muestra con 3 decimales (ej. `5.000 u`), lo cual resulta confuso para unidades físicas de insumos. De la misma manera, el peso debe tener un formato más compacto.

## Solución Propuesta

1. **Stock en Unidades (`u`) y formato entero:**
   - El stock actual (`stock_actual`) y mínimo (`stock_minimo`) de ingredientes pasará a representar unidades físicas. En la UI, siempre se mostrará acompañado por la letra `u` (unidades), independientemente de la unidad de medida que tenga el ingrediente.
   - En el frontend, el stock se mostrará formateado **sin ceros decimales fijos** (ej: `5 u` en lugar de `5.000 u`).
   - El costo unitario pasará a ser por unidad física (`$ / u`).

2. **Nueva Columna de Peso y formato compacto:**
   - Añadir una columna `peso` (tipo `Numeric(10, 3)`, nullable) en la tabla `ingredientes`.
   - Este campo almacenará el peso por unidad del ingrediente, utilizando la unidad de medida configurada para el ingrediente (ej: si un paquete de Muzzarella pesa 1.5 kg, se guardará en la base de datos).
   - En el frontend, el peso se mostrará formateado con **un único cero/decimal después del punto** (ej: `1.5 kg`, `1.0 kg`).

3. **Ciclo de Vida y Gestión de Inactivos (`is_active` & `deleted_at`):**
   - Sincronizar el estado: desactivar un ingrediente (`is_active = False`) setea `deleted_at = datetime.utcnow()`. Habilitar un ingrediente (`is_active = True`) limpia `deleted_at = None`.
   - Eliminar un ingrediente (`DELETE`) realiza un soft delete que marca al ingrediente con `deleted_at` y coloca `is_active = False` para ocultarlo del listado principal de activos de forma inmediata.
   - Ocultar inactivos y soft-deleteados por defecto del listado principal.
   - Agregar un parámetro de consulta `incluir_inactivos` (o `mostrar_inactivos`) en la API.
   - Agregar un interruptor/botón en la interfaz del frontend para alternar la visualización de inactivos. Los inactivos mostrados se renderizarán con opacidad reducida (`opacity-60`) y una etiqueta distintiva.
   - **No habrá botón de borrado permanente (hard delete) en la UI.** Los ingredientes borrados lógicamente seguirán existiendo en base de datos para preservar el historial, y solo se visualizarán al marcar "Mostrar inactivos".

4. **Exportación a Excel:**
   - La exportación a Excel incluirá ingredientes inactivos con su estado explícito y el campo `peso` con su correspondiente unidad de medida.

## Alternativas y Compromisos (Tradeoffs)

- **Alternativa A (Mantener deleted_at sólo para soft-delete permanente y agregar fecha_desactivacion):** Aumentaría el tamaño de la base de datos con campos duplicados de fecha. 
- **Solución Adoptada (Sincronizar is_active y deleted_at):** Al igual que en otros módulos del sistema, la inhabilitación utiliza `deleted_at` como bitácora de desactivación/archivado. Al ser restaurado el ingrediente, la fecha se limpia. Esto mantiene la simplicidad de la base de datos y la coherencia del diseño físico.

