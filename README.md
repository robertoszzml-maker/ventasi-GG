# CRM Pintegralco

El CRM de **Pintegralco** es una herramienta para gestionar los presupuestos.

---

## Requisitos

- **Node.js**
- **Npm**

## Clonar el repositorio

Para obtener el código fuente del CRM de **Pintegralco**, cloná el repositorio con el siguiente comando:

```bash
git clone git@github.com:alejandroabele/pinte-crm.git
```

Una vez que hayas clonado el repositorio, navega al directorio del proyecto e instala las dependencias con:

```bash
cd pinte-crm
npm install
```

## Configuración de Variables de Entorno

Este proyecto utiliza archivos `.env` para configurar las variables. **Siempre se usa `.env`** (git ignored).

### Archivos de ejemplo disponibles

- **`.env.development.example`**: Valores para desarrollo local
- **`.env.example`**: Valores para producción

### Estructura

```
.env                              # Archivo activo (git ignored)
.env.development.example          # Ejemplo desarrollo
.env.example                      # Ejemplo producción
packages/front/.env               # Archivo activo frontend
packages/front/.env.development.example
packages/front/.env.example
packages/api/.env                 # Archivo activo backend
packages/api/.env.development.example
packages/api/.env.example
packages/afip-api/.env            # Archivo activo AFIP
packages/afip-api/.env.development.example
packages/afip-api/.env.example
```

### Configuración rápida con script

Usa el script de configuración automática:

```bash
./setup-env.sh
```

Este script te guiará para configurar todos los archivos `.env` según el entorno seleccionado (desarrollo, producción o test).

### Configuración manual

#### Para desarrollo local

Copia los archivos `.env.development.example` a `.env`:

```bash
cp .env.development.example .env
cp packages/front/.env.development.example packages/front/.env
cp packages/api/.env.development.example packages/api/.env
cp packages/afip-api/.env.development.example packages/afip-api/.env
```

Luego ejecuta:

```bash
npm run dev
```

#### Para producción

Copia los archivos `.env.example` a `.env`:

```bash
cp .env.example .env
cp packages/front/.env.example packages/front/.env
cp packages/api/.env.example packages/api/.env
cp packages/afip-api/.env.example packages/afip-api/.env
```

Luego actualiza las contraseñas y secrets.

### Assets públicos (logos e iconos)

Los logos y iconos de la aplicación deben configurarse en `packages/front/public/`:

- `logo.png` - Logo principal (web/navegación)
- `logo_pdf.png` - Logo para PDFs (presupuestos y órdenes)
- `web-app-manifest-192x192.png` - Icono PWA (192x192)
- `web-app-manifest-512x512.png` - Icono PWA (512x512)

**Estos archivos están ignorados en git** y deben agregarse manualmente en cada entorno.

Ver [`packages/front/public/README.md`](packages/front/public/README.md) para especificaciones detalladas.

---

Y por ultimo levantar el proyecto con el siguiente comando

```bash
npm run dev
```

### Nota para hacer build del front

Se deduplican las depedencias de react, al hacer el build, hay que eliminar el react que esta localmente

### Pasos para deployar en una VPS

#### 1. Preparar el servidor

```bash
# Deshabilitar nginx del sistema (si existe)
sudo systemctl disable nginx

# Dar permisos de ejecución al script
chmod +x entrypoint.sh
```

#### 2. Configurar variables de entorno

**IMPORTANTE:** Debes configurar los archivos `.env` antes de levantar el stack.

**Opción A: Usar el script automático (recomendado)**

```bash
./setup-env.sh
```

Selecciona el entorno apropiado y el script copiará todos los archivos necesarios.

**Opción B: Manual**

```bash
# Para producción
cp .env.example .env
cp packages/front/.env.example packages/front/.env
cp packages/api/.env.example packages/api/.env
cp packages/afip-api/.env.example packages/afip-api/.env

# Para test
cp .env.example .env
cp packages/front/.env.example packages/front/.env
cp packages/api/.env.example packages/api/.env
cp packages/afip-api/.env.example packages/afip-api/.env
# Luego edita .env de la raíz y cambia APP_ENV="test"
```

**Después de copiar los archivos, edita cada `.env` para configurar:**

- Contraseñas de base de datos
- Secrets de JWT
- Dominio del servidor
- Credenciales de servicios externos
- **`PUBLIC_URL`** en `packages/api/.env` - URL para assets públicos en PDFs (ej: `https://tu-dominio.com`)

**Verifica que las siguientes variables en `.env` de la raíz estén configuradas:**

- `APP_ENV="production"` para producción o `APP_ENV="test"` para test
- `SERVER_NAME="tu-dominio.com"` - **IMPORTANTE**: Tu dominio o IP del servidor

#### 3. Configurar Nginx para primera vez (sin SSL)

Antes del primer despliegue, edita `nginx.conf.template` y comenta el bloque del servidor HTTPS:

```nginx
# Comentar temporalmente estas líneas (desde "# COMENTAR LA PRIMERA VEZ..." hasta el final del server block)
# server {
#     listen 443 ssl;
#     ...
# }
```

También comenta el certbot en `docker-compose.yml`:

```yaml
# Comentar estas líneas temporalmente
#certbot:
#  image: certbot/certbot:latest
#  ...
```

#### 4. Levantar el stack

```bash
./entrypoint.sh
```

El script:

- Verificará que todos los `.env` estén presentes
- Generará `nginx.conf` desde `nginx.conf.template` usando tu `SERVER_NAME`
- Levantará todos los contenedores

#### 5. Generar certificado SSL (primera vez)

```bash
docker compose run --rm certbot certonly --webroot --webroot-path /var/www/certbot/ -d tu-dominio.com
```

Reemplaza `tu-dominio.com` con el valor de `SERVER_NAME` de tu `.env`.

#### 6. Habilitar HTTPS

1. Descomenta el bloque HTTPS en `nginx.conf.template`
2. Descomenta el servicio certbot en `docker-compose.yml`
3. Reinicia el stack:

```bash
./entrypoint.sh
```

#### 7. Renovación automática

El contenedor de certbot renovará automáticamente los certificados cada 12 horas.

**Nota:** El archivo `nginx.conf` se genera automáticamente en cada deployment usando el template y las variables de tu `.env`.

### Renovar el certificado

Por defecto los certificados se renuevan cada 3 meses. Se puede renovar con el sigueitne comando

```bash
docker-compose run --rm certbot renew --force-renewal
```

### Eliminar las imagenes en desuso

`docker rmi $(docker images -f "dangling=true" -q)`

## Datos Técnicos

### Fechas

- Las fechas se envían como strings en formato YYYY-MM-DD (ej.: "2025-05-11").
- Los datetime se almacenan en UTC usando getTodayDateTime.
- Los datetime se visualizan en el frontend ajustados a la zona horaria local con formatDateTime.
- Los date se visualizan con formatDate.

### Resolver max watch en desarrollo Ubuntu

pkill -f node

### USUARIO ROOT


admin@template.local
Admin123!
