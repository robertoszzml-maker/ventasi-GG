# Configuración de Nginx Parametrizada

## 📋 Estructura de Archivos

### Archivo Template (commiteado en git)

- `nginx.conf.template` - Template con variables parametrizadas

### Archivo Generado (git ignored)

- `nginx.conf` - Generado automáticamente al ejecutar `./entrypoint.sh`

### Archivos Eliminados

- ~~`nginx.conf.production`~~ - Ya no se usa
- ~~`nginx.conf.test`~~ - Ya no se usa

## 🎯 Cómo Funciona

### 1. Variables en .env

Define `SERVER_NAME` en tu archivo `.env` de la raíz:

```bash
# Ejemplo para producción
SERVER_NAME=mi-dominio.com
APP_ENV=production

# Ejemplo para test
SERVER_NAME=test.mi-dominio.com
APP_ENV=test

# Ejemplo para desarrollo local
SERVER_NAME=localhost
APP_ENV=development
```

### 2. Template con Placeholders

El archivo `nginx.conf.template` contiene variables que serán reemplazadas:

```nginx
server {
    listen 80;
    server_name ${SERVER_NAME};  # ← Se reemplaza con el valor del .env

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://${SERVER_NAME}$request_uri;  # ← Aquí también
    }
}

server {
    listen 443 ssl;
    server_name ${SERVER_NAME};  # ← Y aquí

    ssl_certificate /etc/nginx/ssl/live/${SERVER_NAME}/fullchain.pem;  # ← Y aquí
    ssl_certificate_key /etc/nginx/ssl/live/${SERVER_NAME}/privkey.pem;  # ← Y aquí

    # ... resto de la configuración
}
```

### 3. Generación Automática

Al ejecutar `./entrypoint.sh`, el script:

1. Lee `SERVER_NAME` del `.env`
2. Procesa `nginx.conf.template` con `envsubst`
3. Genera `nginx.conf` con los valores reales
4. Docker usa el `nginx.conf` generado

```bash
# Comando ejecutado internamente
envsubst '${SERVER_NAME}' < nginx.conf.template > nginx.conf
```

### Ejemplo de Resultado

**Entrada (nginx.conf.template):**

```nginx
server_name ${SERVER_NAME};
ssl_certificate /etc/nginx/ssl/live/${SERVER_NAME}/fullchain.pem;
```

**Salida (nginx.conf) con SERVER_NAME=example.com:**

```nginx
server_name example.com;
ssl_certificate /etc/nginx/ssl/live/example.com/fullchain.pem;
```

## 🚀 Uso

### Primera Configuración

```bash
# 1. Configurar .env con tu dominio
echo 'SERVER_NAME=mi-dominio.com' >> .env

# 2. Ejecutar entrypoint (genera nginx.conf automáticamente)
./entrypoint.sh
```

### Cambiar de Dominio

```bash
# 1. Actualizar SERVER_NAME en .env
sed -i 's/SERVER_NAME=.*/SERVER_NAME=nuevo-dominio.com/' .env

# 2. Regenerar y reiniciar
./entrypoint.sh
```

### Modificar la Configuración de Nginx

```bash
# 1. Editar el template
nano nginx.conf.template

# 2. Regenerar y reiniciar
./entrypoint.sh
```

## ✨ Ventajas

✅ **Un solo archivo**: `nginx.conf.template` para todos los entornos  
✅ **Parametrizado**: Cambia el dominio editando solo `.env`  
✅ **Automático**: No más copias manuales de archivos  
✅ **Seguro**: `nginx.conf` generado está en `.gitignore`  
✅ **Simple**: Menos archivos que mantener  
✅ **Flexible**: Fácil agregar más variables si es necesario

## 🔧 Variables Disponibles

Actualmente soportadas en el template:

| Variable         | Descripción          | Ejemplo       |
| ---------------- | -------------------- | ------------- |
| `${SERVER_NAME}` | Dominio del servidor | `example.com` |

### Agregar Más Variables

Para agregar nuevas variables al template:

1. Agregar la variable en `.env`:

   ```bash
   MI_NUEVA_VAR=valor
   ```

2. Usar en `nginx.conf.template`:

   ```nginx
   # Ejemplo
   proxy_set_header X-Custom ${MI_NUEVA_VAR};
   ```

3. Actualizar el comando envsubst en `entrypoint.sh`:
   ```bash
   envsubst '${SERVER_NAME} ${MI_NUEVA_VAR}' < nginx.conf.template > nginx.conf
   ```

## 📝 Notas Importantes

- ⚠️ **NO editar `nginx.conf` directamente** - se sobreescribe en cada deployment
- ✅ Todos los cambios deben hacerse en `nginx.conf.template`
- ✅ `nginx.conf` se genera automáticamente
- ✅ `nginx.conf` está en `.gitignore` (no se commitea)
- ✅ `nginx.conf.template` sí se commitea

## 🐛 Troubleshooting

### nginx.conf no se genera

```bash
# Verificar que existe el template
ls -la nginx.conf.template

# Verificar que SERVER_NAME esté definido
grep SERVER_NAME .env

# Generar manualmente para debug
envsubst '${SERVER_NAME}' < nginx.conf.template > nginx.conf
```

### Variables no se reemplazan

Verifica que:

1. La variable esté exportada en el shell
2. La sintaxis en el template sea `${VARIABLE}` (con llaves)
3. La variable esté incluida en el comando envsubst

### Error: envsubst: command not found

Instalar el paquete `gettext-base`:

```bash
# Ubuntu/Debian
sudo apt-get install gettext-base

# Alpine (en Dockerfile si es necesario)
RUN apk add --no-cache gettext
```
