# CLAUDE.md

Este archivo proporciona orientación a Claude Code cuando trabaja con código en este repositorio.

## ⚠️ REGLA FUNDAMENTAL: VERIFICAR SKILLS PRIMERO

**ANTES de implementar CUALQUIER funcionalidad, SIEMPRE:**

1. 🔍 **Verificar si existe un skill** para la tarea en `.claude/skills/`
2. 📖 **Leer el skill completo** (SKILL.md, reference.md, examples.md)
3. ✅ **Seguir los patrones** y convenciones documentados en el skill
4. ❌ **NO implementar sin revisar** los skills relevantes

### Skills Disponibles

Revisa `.claude/skills/` para ver todos los skills. Algunos ejemplos clave:

- **migraciones-sql**: Cambios en base de datos
- **manejo-fechas**: Gestión de fechas y timestamps
- **modulos-backend**: Crear módulos NestJS
- **servicios-backend**: Servicios con QueryBuilder, relaciones y filtros avanzados
- **paginas-crud-frontend**: Crear páginas CRUD
- **formularios**: Crear formularios con validación
- **tablas-frontend**: Crear tablas con TanStack Table
- **hooks-frontend**: Crear hooks de React Query
- **servicios-frontend**: Crear servicios API
- **sistema-permisos**: Control de acceso RBAC
- Y muchos más...

**Si implementas algo sin verificar los skills primero, estás violando las convenciones del proyecto.**

## Contexto del Proyecto

Sistema **CRM Pintegralco** - Aplicación de gestión empresarial para administración de presupuestos, recursos, facturación y contabilidad.

## Arquitectura del Monorepo

Monorepo con tres paquetes principales:

- **packages/api**: Backend NestJS + TypeORM + MySQL (puerto 3001)
- **packages/front**: Frontend Next.js + React + shadcn/ui (puerto 3000)
- **packages/afip-api**: Microservicio NestJS para integración AFIP (puerto 4001)

## Stack Tecnológico

### Backend
- **Framework**: NestJS
- **ORM**: TypeORM
- **Base de Datos**: MySQL
- **Autenticación**: JWT
- **Eventos**: EventEmitter2

### Frontend
- **Framework**: Next.js (App Router)
- **UI**: React + shadcn/ui + Tailwind CSS
- **Estado**: TanStack Query (servidor) + Zustand (global)
- **Formularios**: react-hook-form + Zod
- **Tablas**: TanStack Table

## Patrón de Arquitectura

### Backend
- Módulos NestJS en `packages/api/src/modules/[modulo]/`
- Imports absolutos con alias `@/`
- Subscribers de TypeORM en `packages/api/src/subscribers/`

### Frontend
- Arquitectura por capas: services → hooks → componentes
- **Services** (`src/services/`): Llamadas API con `fetchClient`
- **Hooks** (`src/hooks/`): TanStack Query para estado del servidor
- **Components** (`src/components/`): UI reutilizables

## Convenciones

- **Idioma**: Código en español (variables, funciones, clases)
- **Nomenclatura**:
  - Archivos: `kebab-case`
  - Columnas BD: `snake_case`
  - Variables/Funciones: `camelCase`
  - Clases: `PascalCase`
- **Imports absolutos**: `@/` en ambos paquetes

## Migraciones de Base de Datos

**IMPORTANTE**: Al crear nuevas funcionalidades que requieran cambios en la base de datos (nuevas tablas, columnas, permisos, etc.), **SIEMPRE** debes crear una migración SQL.

- **Ubicación**: `packages/api/sql/`
- **Skill**: Usa el skill `migraciones-sql` para crear migraciones siguiendo las convenciones del proyecto
- Ver el skill para reglas completas, templates y ejemplos

## Flujo de Trabajo para Nuevas Funcionalidades

**Para CUALQUIER nueva funcionalidad:**

1. 🔍 **Revisar `.claude/skills/`** - Verificar skills relevantes
2. 📖 **Leer documentación completa** del skill (SKILL.md, reference.md, examples.md)
3. 🎯 **Aplicar patrones** documentados en los skills
4. 🔧 **Implementar** siguiendo las convenciones
5. 📝 **Crear migración SQL** si hay cambios en BD (skill `migraciones-sql`)
6. ✅ **Validar** que se siguieron todos los patrones del skill

**Nunca implementes sin consultar los skills primero. Cada skill contiene:**
- Patrones establecidos del proyecto
- Reglas críticas que NO se pueden violar
- Templates y ejemplos completos
- Referencias técnicas detalladas

**Los skills son la única fuente de verdad para las convenciones del proyecto.**
