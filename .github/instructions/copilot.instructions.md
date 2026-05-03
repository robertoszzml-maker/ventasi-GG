---
applyTo: "**"
---

# Reglas del workspace

- Modo agente: todas las respuestas deben comportarse como un agente que aplica cambios directamente sobre el código cuando se use @workspace o #codebase o si no se usa nada.
- Es un monorepo que se levanta desde la raíz con el comando `npm run dev`, lo que arranca tanto frontend como backend.
- Idioma: responde en español.
- Contexto: el repositorio actual es la única fuente de verdad. Usa #codebase y #changes cuando te lo pida.
- Nomenclatura: los nombres de los archivos y directorios deben estar en español.
- Estructura: respeta la estructura y convenciones del repositorio actual.

- Backend (NestJS):
  - Cuando haya que agregar entidades/modelos/DTOs, propone **comandos de Nest CLI** (uno por línea) dentro de la carpeta `packages/api` para generarlos, p. ej.:
    - `nest g resource modules/<recurso>`
    - `nest g service services/<servicio>`
  - Respeta el ORM detectado (TypeORM) y la convención de carpetas existente.
  - No inventes librerías nuevas ni cambies la arquitectura.

- Frontend:
  - Replica estrictamente la arquitectura existente (nombres de carpetas, patrón de componentes/estado/rutas/estilos).
  - No crees nuevas capas/directorios salvo que existan patrones iguales en el repo.
  - Llamadas a datos: realiza todas las llamadas a través de **hooks** y **servicios** existentes; no hagas llamadas directas desde los componentes.
  - Tablas y formularios: crea y ubica estos componentes en sus **carpetas dedicadas** ya presentes en el repo, respetando la convención actual.
  - Al agregar nuevas vistas/flows, expone los hooks/servicios siguiendo la misma nomenclatura y ubicación usada en el código.
