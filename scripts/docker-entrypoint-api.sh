#!/bin/sh
set -e

echo "=== KOHALOCK API Startup Initialization ==="

echo "--> Waiting for PostgreSQL database (postgres:5432)..."
until node -e "const net = require('net'); const client = net.connect({host: 'postgres', port: 5432}, () => { client.end(); process.exit(0); }); client.on('error', () => process.exit(1));"; do
  sleep 1
done
echo "--> PostgreSQL is connected!"

echo "--> Waiting for Hardhat Blockchain Node (blockchain:8545)..."
until node -e "const net = require('net'); const client = net.connect({host: 'blockchain', port: 8545}, () => { client.end(); process.exit(0); }); client.on('error', () => process.exit(1));"; do
  sleep 1
done
echo "--> Hardhat Blockchain is connected!"

echo "--> Deploying DanaDesaLedger Smart Contract..."
pnpm --filter contracts exec hardhat run scripts/deploy.ts --network localhost || true

echo "--> Copying ABI to API configuration..."
pnpm --filter contracts exec ts-node scripts/copy-abi.ts || true

echo "--> Pushing Prisma Schema to PostgreSQL..."
pnpm --filter api exec prisma db push

echo "--> Seeding initial database users & blockchain roles..."
pnpm --filter api exec prisma db seed || true

echo "--> Starting Express Backend API in development mode..."
exec pnpm --filter api dev
