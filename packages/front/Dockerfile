# Usa una imagen base de Node.js
FROM node:20 AS builder

# Establece el directorio de trabajo
WORKDIR /app

# Define el ARG para APP_ENV
ARG APP_ENV
ENV APP_ENV=${APP_ENV}

# Copia los archivos de configuración del proyecto
COPY package.json yarn.lock* ./

# Instala las dependencias
RUN npm install --legacy-peer-deps

# Copia el resto del código
COPY . .

# El archivo .env ya debe estar presente en el contexto
# Next.js lo leerá automáticamente durante el build
RUN if [ ! -f .env ]; then echo "ERROR: .env no encontrado" && exit 1; fi

# Construye la aplicación
RUN npm run build

# Usa una imagen ligera para servir la aplicación
FROM node:20-alpine

WORKDIR /app

# Copia los archivos construidos desde la etapa anterior
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Expone el puerto 3000
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]
