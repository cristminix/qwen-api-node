#!/bin/bash

# Load environment variables from .env.kimi file
if [ -f .env.kimi ]; then
    export $(grep -v '^#' .env.kimi | xargs)
    echo "Loaded environment variables from .env.kimi"
else
    echo "Error: .env.kimi file not found"
    exit 1
fi

# Start the application
echo "Starting Kimi service on port $PORT..."
# node build/index.js
pnpm dev
