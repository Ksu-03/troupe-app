#!/bin/bash
set -e

echo "========================================="
echo "Troupe Backend - Starting..."
echo "========================================="

cd backend

echo "📦 Installing dependencies..."
npm install

echo "🗄️  Generating Prisma client..."
npx prisma generate

echo "🗄️  Running database migrations..."
npx prisma migrate deploy || echo "Migrations already applied"

echo "🚀 Starting server..."
node src/server.js
