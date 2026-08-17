# Dockerfile for Backend API Service (KOHALOCK)
FROM node:20-alpine AS base

WORKDIR /app

# Install pnpm v10 via npm globally
RUN npm install -g pnpm@10

# Copy monorepo package definitions
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/contracts/package.json ./packages/contracts/

# Install dependencies
RUN pnpm install

# Copy source code and scripts
COPY apps/api ./apps/api
COPY packages/contracts ./packages/contracts
COPY scripts ./scripts

# Generate Prisma Client
RUN pnpm --filter api exec prisma generate

# Create uploads directory if not exists
RUN mkdir -p /app/apps/api/uploads

EXPOSE 3000

ENTRYPOINT ["/app/scripts/docker-entrypoint-api.sh"]
