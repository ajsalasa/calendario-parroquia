#!/usr/bin/env bash
# Simple script to set up the project environment and start the dev server

set -e

NODE_REQUIRED=18

# Verify Node.js installation
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required. Please install Node.js ${NODE_REQUIRED} or higher." >&2
  exit 1
fi

NODE_MAJOR=$(node -v | cut -d'.' -f1 | tr -d 'v')
if [ "$NODE_MAJOR" -lt "$NODE_REQUIRED" ]; then
  echo "Node.js ${NODE_REQUIRED}+ is required. Current version: $(node -v)" >&2
  exit 1
fi

echo "Installing npm dependencies..."
npm install

echo "Starting development server..."
npm run dev
