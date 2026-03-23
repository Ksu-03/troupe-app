#!/bin/bash
set -e
echo "========================================="
echo "Troupe Backend - Starting..."
echo "========================================="

cd backend

echo "📦 Installing dependencies..."
npm install

echo "🗄️  Running database migrations..."
npx prisma migrate deploy

echo "🌱 Seeding database..."
npx prisma db seed || echo "Seeding skipped (already seeded)"

echo "⚙️  Generating Prisma client..."
npx prisma generate

echo "🚀 Starting server..."
npm start
