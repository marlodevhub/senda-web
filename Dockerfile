# syntax=docker/dockerfile:1
# senda-web: build de Next.js en modo standalone; la imagen final solo lleva
# el servidor compilado y corre sin privilegios.
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Las NEXT_PUBLIC_* se fijan al construir: la plataforma (Render) las pasa como build args. Opcional.
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID=""
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
RUN npm run build

FROM node:24-alpine AS run
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup -S senda && adduser -S senda -G senda
COPY --from=build --chown=senda:senda /app/.next/standalone ./
COPY --from=build --chown=senda:senda /app/.next/static ./.next/static
# Íconos de la app instalable (PWA): el modo standalone no copia public/ solo.
COPY --from=build --chown=senda:senda /app/public ./public
USER senda
EXPOSE 3000
# BACKEND_URL (URL de senda-api) y ADMIN_INVITES_ENABLED llegan por entorno al ejecutar. PORT lo puede fijar la
# plataforma (Render usa 10000); server.js lo respeta.
CMD ["node", "server.js"]
