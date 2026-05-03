# Use the official Node.js image as the base image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Define el ARG para APP_ENV
ARG APP_ENV
ENV APP_ENV=${APP_ENV}

# Copiar el package.json y package-lock.json al directorio de trabajo
COPY package*.json ./

# Instalar las dependencias de la aplicación
RUN npm install --legacy-peer-deps

# Copiar el resto de los archivos de la aplicación
COPY . .

# El archivo .env ya debe estar presente en el contexto (copiado en el paso anterior)
# Verificar que exista
RUN if [ ! -f .env ]; then echo "ERROR: .env no encontrado" && exit 1; fi

# Build de la aplicación NestJS
RUN npm run build

# Exponer el puerto de la aplicación
EXPOSE 3001

# Comando para ejecutar la aplicación
CMD ["node", "dist/main"]
