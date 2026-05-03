# Docker Setup Instructions

## Problemas Solucionados

### 1. Configuración MySQL Corregida
- **Imagen actualizada:** `mysql:8.0` en lugar de `mysql:latest`
- **Variables de entorno explícitas:** Se agregaron `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_ROOT_HOST`
- **Plugin de autenticación:** `--default-authentication-plugin=mysql_native_password` para compatibilidad
- **Healthcheck simplificado:** Sintaxis correcta sin expansión de variables

### 2. Variables de Entorno
- **MYSQL_HOST:** Cambiado de `localhost` a `mysql` (nombre del servicio Docker)
- **Contraseña segura:** `dev_password_123` para desarrollo
- **Permisos:** `MYSQL_ROOT_HOST=%` permite conexiones desde otros contenedores

## Pasos para Levantar el Proyecto

### 1. Configurar Variables de Entorno
```bash
# Copiar archivo de desarrollo
cp .env.development .env

# O editar manualmente el .env con:
MYSQL_ROOT_PASSWORD=dev_password_123
MYSQL_DATABASE=pintegralco
MYSQL_HOST=mysql
MYSQL_PORT=3306
MYSQL_ROOT_HOST=%
APP_ENV=development
```

### 2. Limpiar Datos Anteriores (si es necesario)
```bash
# Detener contenedores
docker-compose down

# Eliminar volumen de MySQL (cuidado: borra datos)
docker volume rm ventasi_mysql_data

# O simplemente eliminar contenedor
docker-compose rm -f mysql
```

### 3. Levantar Servicios
```bash
# Levantar todos los servicios
docker-compose up -d

# Verificar estado
docker-compose ps

# Ver logs de MySQL
docker-compose logs mysql
```

### 4. Verificar Conexión
```bash
# Entrar al contenedor MySQL
docker exec -it mysql_db mysql -u root -p

# Usar contraseña: dev_password_123
```

## Solución de Problemas Comunes

### Access Denied
- Verificar que `.env` tenga `MYSQL_ROOT_PASSWORD` no vacía
- Confirmar que `MYSQL_HOST=mysql` (no localhost)
- Esperar 30-60 segundos después de iniciar MySQL

### Container Unhealthy
- Revisar logs: `docker-compose logs mysql`
- Limpiar volúmenes: `docker volume prune`
- Reiniciar: `docker-compose restart mysql`

### Conexión desde API
El servicio API debe usar:
- Host: `mysql` (nombre del servicio)
- Puerto: `3306`
- Usuario: `root`
- Contraseña: `dev_password_123`
