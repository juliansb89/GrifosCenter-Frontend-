# Usamos una imagen base de Node (versión LTS)
FROM node:18-alpine

# Definimos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos el package.json y el package-lock.json
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos todo el resto del código fuente
COPY . .

# Exponemos el puerto 4000 (el que su aplicación usa)
EXPOSE 4000

# Comando para iniciar la aplicación
CMD ["npm", "start"]