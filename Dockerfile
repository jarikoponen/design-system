# syntax=docker/dockerfile:1.7

# ----- Stage 1: build -----
FROM node:22-alpine AS build
WORKDIR /app

# Beroende-lager: cache:as bara om package*.json ändras
COPY package.json package-lock.json* ./
RUN npm ci

# Källkod och tokens
COPY . .

# Bygg sajten – prebuild kör tokens:build + llms:build, postbuild kör copy-markdown-sources
RUN npm run build

# ----- Stage 2: runtime -----
FROM caddy:2-alpine AS runtime
WORKDIR /srv

COPY --from=build /app/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 8080

# Caddy använder /etc/caddy/Caddyfile automatiskt
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
