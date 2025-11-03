# syntax=docker/dockerfile:1

FROM node:20-alpine AS deps
WORKDIR /app/web

# 1) Copy only manifests to unlock cache
COPY web/package.json web/package-lock.json ./

# 2) Cache npm tarballs between builds
RUN --mount=type=cache,target=/root/.npm \
    npm ci --cache /root/.npm --prefer-offline

# ---------- build ----------
FROM deps AS build
WORKDIR /app

# 3) Copy the minimal extra files first (low churn -> better cache)
COPY chains.yaml ./chains.yaml
# 4) Copy the app source
COPY web ./web

# (node_modules already present from deps)
WORKDIR /app/web

# 5) Keep npm/Vite cache hot during build
RUN --mount=type=cache,target=/root/.npm \
    npm run build

# ---------- runtime ----------
FROM node:20-alpine AS preview
WORKDIR /app
COPY --from=build /app/web/dist ./dist
RUN npm install -g serve
EXPOSE 8000
CMD ["serve", "-s", "dist", "-l", "8000"]
