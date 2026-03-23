#!/bin/bash
set -e
echo "Starting Troupe Backend..."
cd backend
echo "Installing dependencies..."
npm install
echo "Generating Prisma client..."
npx prisma generate
echo "Starting server..."
npm start
