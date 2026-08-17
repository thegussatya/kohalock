# Dockerfile for Hardhat Contracts Service (KOHALOCK)
FROM node:20-alpine AS base

WORKDIR /app

# Install pnpm v10 via npm globally
RUN npm install -g pnpm@10

# Copy monorepo package definitions
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/contracts/package.json ./packages/contracts/
COPY apps/api/package.json ./apps/api/

# Install dependencies for contracts workspace
RUN pnpm install --filter contracts...

# Copy source files for contracts
COPY packages/contracts ./packages/contracts

EXPOSE 8545

CMD ["pnpm", "--filter", "contracts", "exec", "hardhat", "node", "--hostname", "0.0.0.0"]
