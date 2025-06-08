#!/bin/bash
# Vercel build script for admin app with proper Prisma engine handling

echo "Starting Vercel build with Prisma engine setup..."

# Navigate to root
cd ../..

# Install dependencies
echo "Installing dependencies..."
corepack enable
pnpm install

# Generate Prisma client
echo "Generating Prisma client..."
cd packages/db
pnpm prisma generate

# Copy engines to the expected locations
echo "Setting up Prisma engines..."
mkdir -p ../../apps/web/.prisma/client
mkdir -p ../../apps/admin/.prisma/client

# Copy query engines to both apps
if [ -d "../../node_modules/.pnpm/@prisma+client*/node_modules/.prisma/client" ]; then
    cp -r ../../node_modules/.pnpm/@prisma+client*/node_modules/.prisma/client/* ../../apps/web/.prisma/client/
    cp -r ../../node_modules/.pnpm/@prisma+client*/node_modules/.prisma/client/* ../../apps/admin/.prisma/client/
fi

# Build the project
echo "Building project..."
cd ../..
pnpm turbo build --filter=@repo/admin

echo "Build completed!"
