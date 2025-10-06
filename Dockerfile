# syntax=docker/dockerfile:1

FROM node:20-alpine AS deps
WORKDIR /app

# Copy package manifests first to leverage Docker layer caching
COPY web/package.json web/package-lock.json ./web/

WORKDIR /app/web
RUN npm ci

FROM deps AS build
WORKDIR /app
COPY chains.yaml ./chains.yaml
COPY web ./web
WORKDIR /app/web
RUN npm run build

FROM node:20-alpine AS preview
WORKDIR /app
COPY --from=build /app/web/dist ./dist
RUN npm install -g serve
EXPOSE 8000
CMD ["serve", "-s", "dist", "-l", "8000"]
