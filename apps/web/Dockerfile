# Multi-stage Dockerfile for React Vite Frontend (KOHALOCK)
FROM node:20-alpine AS base

WORKDIR /app

# Install pnpm v10 via npm globally
RUN npm install -g pnpm@10

# Copy workspace package configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/

# Install dependencies for web workspace
RUN pnpm install --filter web...

# Copy frontend source files
COPY apps/web ./apps/web

# --- Development Stage (Default for docker-compose local setup) ---
FROM base AS dev
EXPOSE 5173
CMD ["pnpm", "--filter", "web", "dev", "--host", "0.0.0.0", "--port", "5173"]

# --- Production Build Stage ---
FROM base AS builder
ARG VITE_API_URL=http://localhost:3000/api
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm --filter web build

# --- Production Nginx Runner Stage ---
FROM nginx:alpine AS runner
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
