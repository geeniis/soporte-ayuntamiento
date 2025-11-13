# Usa la imagen oficial de Node
FROM node:20-alpine

# Crea el directorio de trabajo
WORKDIR /app

# Copia package.json y package-lock.json
COPY package*.json ./

# Instala dependencias
RUN npm install

# Generate Prisma client at build time so @prisma/client is available in the image
RUN npx prisma generate --schema prisma/schema.prisma || true

# Copia el resto del proyecto
COPY . .

# Expone el puerto 3000
EXPOSE 3000

# Comando por defecto
CMD ["npm", "run", "dev"]
