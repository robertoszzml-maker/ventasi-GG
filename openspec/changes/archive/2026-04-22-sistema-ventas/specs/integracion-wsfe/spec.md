## ADDED Requirements

### Requirement: Solicitar CAE a ARCA wsfe
El módulo `wsfe` de `afip-api` SHALL exponer el MessagePattern `solicitar-cae` que recibe los datos de la venta y llama a `FECAESolicitar` del webservice ARCA wsfe. Debe autenticarse previamente con WSAA (reutilizando el servicio de login existente). Retorna CAE, fecha de vencimiento y número de comprobante autorizado, o un error estructurado.

#### Scenario: CAE obtenido exitosamente
- **WHEN** `afip-api` recibe `solicitar-cae` con datos de venta válidos
- **THEN** llama a WSAA para obtener token, luego llama a `FECAESolicitar`, y retorna `{ cae, caeVencimiento, nroComprobante }`

#### Scenario: ARCA rechaza el comprobante
- **WHEN** ARCA retorna resultado con código de error (Obs o Err en la respuesta)
- **THEN** `afip-api` retorna `{ error: true, codigo, mensaje }` para que `api` lo registre como `pendiente_cae`

#### Scenario: Token de WSAA reutilizado si vigente
- **WHEN** el token de WSAA para el servicio `wsfe` aún no expiró
- **THEN** `afip-api` reutiliza el token cacheado sin llamar nuevamente a WSAA

---

### Requirement: Obtener último número de comprobante autorizado
El módulo `wsfe` SHALL exponer el MessagePattern `obtener-ultimo-comprobante` que llama a `FECompUltimoAutorizado` de ARCA. Retorna el último número autorizado para un tipo de comprobante y punto de venta dados.

#### Scenario: Último número obtenido
- **WHEN** `afip-api` recibe `obtener-ultimo-comprobante` con punto_venta y tipo_comprobante
- **THEN** llama a ARCA y retorna `{ ultimoNro }` que el `api` usa para calcular el siguiente número

#### Scenario: Sin comprobantes previos
- **WHEN** ARCA retorna 0 para el punto de venta (primer comprobante)
- **THEN** `afip-api` retorna `{ ultimoNro: 0 }` y `api` usará el número 1

---

### Requirement: URL wsfe configurable por ambiente
La URL del webservice wsfe SHALL leerse de la variable de entorno `AFIP_WSFE_URL` para soportar homologación y producción sin cambios de código.

#### Scenario: URL de homologación
- **WHEN** `AFIP_WSFE_URL` apunta al endpoint de homologación de ARCA
- **THEN** todas las llamadas wsfe van a homologación

#### Scenario: URL de producción
- **WHEN** `AFIP_WSFE_URL` apunta al endpoint de producción de ARCA
- **THEN** todas las llamadas wsfe van a producción y los CAE emitidos son válidos fiscalmente
