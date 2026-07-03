# REGISTRO DUPLICADO en "Gestiones otras tiendas"

**Fecha:** 2026-07-03 · **Alcance:** solo frontend (portal Bricomart). El backend PHP y el nuevo estado en BD los implementa Jorge (ver Anexo).

## Objetivo

Añadir en la pantalla GESTIONES OTRAS TIENDAS ([src/views/crm/Ventas/SubirParteB.jsx](../../../src/views/crm/Ventas/SubirParteB.jsx)) una opción REGISTRO DUPLICADO para anular un registro por duplicidad. Si el registro ya tiene documentación **firmada** subida (PARTE A FIRMADO o PARTE B FIRMADO — no los documentos generados iniciales), se avisa con un popup de confirmación antes de enviar. El backend, al recibir la marca, cambiará el estado del registro al nuevo estado REGISTRO DUPLICADO y enviará un mail al cliente.

## UI

- Checkbox nuevo "REGISTRO DUPLICADO" debajo de DEVUELTO/ANULADO, mismo estilo que los existentes. Sin campo de texto asociado.
- Modal de confirmación (reactstrap, como los modales existentes de la pantalla):
  - Texto: *"El archivo que desea anular por duplicidad contiene documentación firmada, ¿está seguro que desea anularlo?"*
  - Botones: **Aceptar** (continúa el envío) / **Cancelar** (no se envía nada).

## Flujo al pulsar Guardar (checkbox marcado)

1. Si no hay ID tecleado → `alert` pidiendo el ID (patrón de validación actual).
2. Consulta GraphQL `getVentasAllCentros` con `fields: { CODIGO_VENTA: <id tecleado> }`.
   - Sin resultados → aviso "No se ha encontrado ningún registro con ese ID" y se aborta.
3. Con el `ID` de la venta se consultan sus documentos: `getRetiradaDocumentosId` → `getDocumentosById` por cada uno, y `GET_TIPO_DOCUMENTOS` para resolver los nombres de tipo (mismo patrón que `ShowDocumentosModal`).
4. Si algún documento es de tipo `PARTE A FIRMADO` o `PARTE B FIRMADO` → popup de confirmación. Si no hay firmados → se envía directamente.
5. El POST actual a `LeroyInstalacionesController.php` (acción `cargarpartebinstalaciones`) incluye el campo nuevo `registro_duplicado` ("true"/"false"), igual que hoy `instalacionpropia` y `devuelto`.
6. Si cualquier consulta GraphQL falla → aviso de error y **no** se envía (nunca se anula sin que el aviso haya podido saltar).

Detalle técnico: los valores del formulario se capturan en un objeto antes del chequeo asíncrono y el envío se extrae a una función `enviarFormulario(datos)`, que también usa el botón Aceptar del modal.

## Verificación (manual)

- Registro sin firmados → se envía sin popup, con `registro_duplicado=true`.
- Registro con PARTE A/B FIRMADO → popup; Aceptar envía, Cancelar no envía.
- ID inexistente → aviso y no se envía.
- Los flujos existentes (subir partes, INSTALACION LEROY, DEVUELTO/ANULADO) siguen igual con el checkbox sin marcar (`registro_duplicado=false`).

---

## Anexo — cambios de backend (a implementar por Jorge en el servidor)

> Las copias locales de `LeroyInstalacionesController.php` en `d:\DEV\inproeco\inpronetphp` son de feb-2024 y NO reflejan producción; este snippet es orientativo sobre el patrón existente.

**1. BD:** insertar el estado nuevo en la tabla de estados de Leroy Instalaciones con nombre `REGISTRO DUPLICADO`.

**2. Controller** — en la acción `cargarpartebinstalaciones` (o donde producción procese `instalacionpropia`/`devuelto`), tratar el campo nuevo:

```php
if (isset($_POST['registro_duplicado']) && $_POST['registro_duplicado'] === 'true') {
    $instalacion = LeroyInstalacionesController::obtenerPorCodigo($_POST['identificador']);
    LeroyInstalacionesDao::cambiarEstadoAnt($instalacion->id, $instalacion->estadoId);
    $estado = EstadoLeroyInstalacionesController::obtenerPorNombre('REGISTRO DUPLICADO');
    LeroyInstalacionesDao::cambiarEstado($instalacion->id, $estado->id);
    LeroyInstalacionesController::enviarDuplicado($instalacion->email, $instalacion->codigoVenta);
}
```

```php
function enviarDuplicado($email, $codigo) {
    $rutaPlantilla = realpath($_SERVER["DOCUMENT_ROOT"]) . '/inproecoweb2_0/documentos/emailsnotificacion/duplicadoleroyinstalaciones.html';
    $claves  = array('_CODE_');
    $valores = array($codigo);
    $destinatarios = array($email);
    $asunto = 'Anulación de registro duplicado - Equipo gases fluorados - LEROY MERLÍN';
    EmailController::enviarMailAttachment($rutaPlantilla, $claves, $valores, array_unique($destinatarios), $asunto, -1, array());
}
```

**3. Plantilla de email** `documentos/emailsnotificacion/duplicadoleroyinstalaciones.html` — TEXTO PROVISIONAL, sustituir por el texto definitivo del Word:

```html
<html>
  <body>
    <p>Estimado cliente,</p>
    <p>
      Le informamos de que el registro con c&oacute;digo <strong>_CODE_</strong>,
      correspondiente a la adquisici&oacute;n de un equipo de gases fluorados en
      LEROY MERL&Iacute;N, ha sido anulado por tratarse de un registro duplicado.
    </p>
    <p>
      Si dispone de otro registro para la misma compra, este permanece activo y
      no es necesario que realice ninguna acci&oacute;n. Si considera que la
      anulaci&oacute;n es un error, p&oacute;ngase en contacto con nosotros.
    </p>
    <p>Un saludo,<br/>INPROECO</p>
  </body>
</html>
```

**Asunto provisional:** "Anulación de registro duplicado - Equipo gases fluorados - LEROY MERLÍN".
