#!/bin/bash

echo "Starting local environment setup..."

# Load environment variables from .env.local if present
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

# Install dependencies if not present
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Optional database sync, skipping on error
echo "Syncing database..."
npm run db:push || echo "DB push skipped or failed. Be sure you have local env setup." 

echo "Starting the app..."
npm run dev
