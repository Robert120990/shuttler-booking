# Build del cliente
FROM node:20-alpine AS client-build
WORKDIR /app
COPY client/package.json client/package-lock.json* ./client/
WORKDIR /app/client
RUN npm ci
COPY client/ .
ARG VITE_SERVER_URL
ARG VITE_SITE_URL
ENV VITE_SERVER_URL=$VITE_SERVER_URL
ENV VITE_SITE_URL=$VITE_SITE_URL
RUN npm run build

# Server
FROM node:20-alpine AS server
WORKDIR /app
COPY server/package.json server/package-lock.json* ./server/
WORKDIR /app/server
RUN npm ci --omit=dev

# Copiamos el dist del cliente dentro del árbol del server
WORKDIR /app
COPY --from=client-build /app/client/dist ./client/dist
COPY server/ ./server/

ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/data
ENV IMAGES_DIR=/data/images

# Volumen persistente para DB e imágenes
VOLUME /data

WORKDIR /app/server
EXPOSE 3000
CMD ["node", "src/index.js"]
