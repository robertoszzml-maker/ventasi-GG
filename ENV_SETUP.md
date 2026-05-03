# Guía de Configuración de Variables de Entorno

Este documento detalla cómo configurar las variables de entorno para cada paquete del proyecto.

## 📁 Estructura de Archivos

El proyecto utiliza archivos `.env` (git ignored) con ejemplos para referencia:

```
/
├── .env                          # Archivo activo (git ignored)
├── .env.development.example      # Ejemplo para desarrollo
├── .env.example                  # Ejemplo para producción
├── packages/
│   ├── front/
│   │   ├── .env                  # Archivo activo
│   │   ├── .env.development.example
│   │   └── .env.example
│   ├── api/
│   │   ├── .env                  # Archivo activo
│   │   ├── .env.development.example
│   │   └── .env.example
│   └── afip-api/
│       ├── .env                  # Archivo activo
│       ├── .env.development.example
│       └── .env.example
```

## 🎯 Convención de Archivos

- **`.env`**: Archivo activo usado por Next.js y NestJS (git ignored, NO se commitea)
- **`.env.development.example`**: Ejemplo con valores para desarrollo (commiteado en git)
- **`.env.example`**: Ejemplo con valores para producción (commiteado en git)

## 🚀 Configuración Inicial

### Para Desarrollo Local

Copia los archivos `.env.development.example` a `.env`:

```bash
# Raíz
cp .env.development.example .env

# Frontend
cp packages/front/.env.development.example packages/front/.env

# Backend
cp packages/api/.env.development.example packages/api/.env

# AFIP API
cp packages/afip-api/.env.development.example packages/afip-api/.env
```

Luego ejecuta:

```bash
npm install
npm run dev
```

### Para Producción

Copia los archivos `.env.example` a `.env`:

```bash
# Raíz
cp .env.example .env

# Frontend
cp packages/front/.env.example packages/front/.env

# Backend
cp packages/api/.env.example packages/api/.env

# AFIP API
cp packages/afip-api/.env.example packages/afip-api/.env
```

Luego actualiza las contraseñas y secrets según sea necesario.## 📝 Variables por Paquete

### Raíz (/.env)

Variables para Docker Compose y MySQL:

```bash
APP_NAME="Pintegralco"           # Nombre de la aplicación
SERVER_NAME=""                    # Dominio del servidor
MYSQL_ROOT_PASSWORD=""            # Password de MySQL
MYSQL_DATABASE=pintegralco        # Nombre de la base de datos
MYSQL_HOST=localhost              # Host de MySQL
MYSQL_PORT=3306                   # Puerto de MySQL
APP_ENV="development"             # Entorno: development, production, test
```

### Frontend (packages/front/.env)

Variables de Next.js (deben empezar con `NEXT_PUBLIC_`):

```bash
NEXT_PUBLIC_APP_NAME="Pintegralco"                    # Nombre visible en la app
NEXT_PUBLIC_API_URL=http://localhost:3001/v1/         # URL de la API (cliente)
NEXT_PUBLIC_SSR_API_URL=http://localhost:3001/v1/     # URL de la API (servidor)
NEXT_PUBLIC_STORE_GLOBAL=store_local                   # Nombre del store
NEXT_PUBLIC_API_APP_NAME=nombre_app                    # Identificador de la app
NEXT_PUBLIC_API_COOKIE_NAME=local_pinte_refresh_token  # Nombre de la cookie
NEXT_PUBLIC_API_COOKIE_USER_DATA=userData              # Nombre cookie datos usuario
NEXT_PUBLIC_API_COOKIE_USER_MENU=menuData              # Nombre cookie menú
NEXT_PUBLIC_API_COOKIE_USER_TEAM=teamData              # Nombre cookie equipo
NEXT_PUBLIC_API_OPTION_NAME=local_pinte                # Nombre de opciones
```

### Backend (packages/api/.env)

Variables de NestJS:

```bash
# Aplicación
APP_NAME="Pintegralco"
PUBLIC_URL=http://localhost:3000

# Autenticación
AUTH_KEY=dasdsadsadsadsdsa
AUTH_APP=nombre_app
AUTH_JWT_SECRET=this-is-secret
AUTH_JWT_EXPIRED=10m
AUTH_JWT_REFRESH_SECRET=this-is-other-secret
AUTH_JWT_REFRESH_EXPIRED=24h

# Cookies
COOKIE_EXPIRED=86399999
COOKIE_DOMAIN=localhost
COOKIE_SECURE=false
COOKIE_SESSION_TOKEN_NAME="local_pinte_refresh_token"
AUTH_OPTION_NAME=local_pinte

# Base de datos
MYSQL_DATABASE=pintegralco
MYSQL_PORT=3306
MYSQL_ROOT_PASSWORD=Rafaela$2020
MYSQL_USER=root
MYSQL_HOST=127.0.0.1

# Mail
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_USER=
MAIL_PASSWORD=
MAIL_FROM=noreply@test.com

# PDF y otros servicios
GOTENBERG_URL=https://demo.gotenberg.dev
AFIP_HOST=localhost
TZ="America/Argentina/Buenos_Aires"
```

### AFIP API (packages/afip-api/.env)

Variables para el servicio de AFIP:

```bash
PORT=4001
NODE_ENV=development

# URLs de servicios AFIP
AFIP_WSAA_URL=https://wsaahomo.afip.gov.ar/ws/services/LoginCms?WSDL
AFIP_AMBIENTE=testing
PADRON_SERVICE=ws_sr_constancia_inscripcion
PADRON_WSDL=https://aws.afip.gov.ar/sr-padron/webservices/personaServiceA5?WSDL

# Certificados
AFIP_CERTIFICADO_PATH=./certs/certificado.crt
AFIP_CLAVE_PRIVADA_PATH=./certs/clave.key
CUIT_REPRESENTADA=20379438416

# Configuración
LOG_LEVEL=debug
TEMP_DIR=./.temp
```

## 🌍 Configuración por Entorno

### Desarrollo Local

Los archivos `.env.example` ya vienen con la configuración de desarrollo activa. Solo necesitas:

1. Copiar los archivos `.env.example` a `.env`
2. Actualizar las contraseñas y secrets

### Producción

En cada archivo `.env`, descomenta y activa las líneas de la sección **PRODUCCIÓN**:

```bash
# Frontend
NEXT_PUBLIC_API_URL=https://tu-dominio.com/api/v1/
NEXT_PUBLIC_SSR_API_URL=http://api:3001/v1/

# Backend
COOKIE_DOMAIN=tu-dominio.com
COOKIE_SECURE=true
MYSQL_HOST=mysql

# AFIP
AFIP_WSAA_URL=https://wsaa.afip.gov.ar/ws/services/LoginCms?WSDL
AFIP_AMBIENTE=produccion
```

### Test/Staging

Similar a producción, pero usando los servidores de test.

## 🔒 Seguridad

- **NUNCA** commitees archivos `.env` al repositorio
- Los archivos `.env` están en `.gitignore`
- Solo commitea archivos `.env.example` (sin valores sensibles)
- Cambia todos los secrets en producción
- Usa contraseñas fuertes para MySQL y JWT secrets

## �️ Configuración de URLs Públicas

### Variable `PUBLIC_URL` (Backend)

La variable `PUBLIC_URL` en `packages/api/.env` define la URL base para acceder a assets públicos como logos en PDFs:

**Desarrollo:**

```bash
PUBLIC_URL=http://localhost:3000
```

**Producción:**

```bash
PUBLIC_URL=https://tu-dominio.com
```

Esta URL se usa en:

- Templates de presupuestos (logo_pdf.png)
- Templates de órdenes de trabajo (logo_pdf.png)
- Cualquier asset público que deba ser accesible desde PDFs

**Importante:** Esta URL debe apuntar al servidor donde Next.js sirve los archivos públicos (carpeta `packages/front/public/`).

## �📋 Checklist de Deployment

Antes de deployar a producción, verifica:

- [ ] Todos los secrets están actualizados
- [ ] `COOKIE_SECURE=true` en producción
- [ ] URLs apuntan a los servicios correctos
- [ ] Certificados AFIP están en la ubicación correcta
- [ ] Variables de timezone configuradas
- [ ] Log levels apropiados (info/error en producción)

## 🆘 Troubleshooting

### El frontend no puede conectar con el backend

Verifica que `NEXT_PUBLIC_API_URL` apunte a la URL correcta.

### Error de autenticación

Verifica que `AUTH_JWT_SECRET` sea el mismo en todos los entornos que compartan usuarios.

### Error de conexión a MySQL

Verifica `MYSQL_HOST`, `MYSQL_PORT` y las credenciales en el `.env` del backend.

### Error en servicio AFIP

Verifica que los certificados existan en la ruta especificada y que `AFIP_AMBIENTE` corresponda con la URL de `AFIP_WSAA_URL`.
