#!/bin/bash
set -e

echo "========================================="
echo "Starting Troupe Backend..."
echo "========================================="

cd backend

echo "📦 Installing dependencies..."
npm install

echo "🗄️  Running database migrations..."
npx prisma migrate deploy || echo "Migrations already applied"

echo "🚀 Starting server..."
node src/server.js
