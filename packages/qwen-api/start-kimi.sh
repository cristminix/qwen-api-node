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

# Handle optional argument
case "${1:-dev}" in
    "dist")
        echo "Running production build..."
        node build/index.js
        ;;
    "dev"|"")
        echo "Running development mode..."
        pnpm dev
        ;;
    *)
        echo "Usage: $0 [dist|none|dev]"
        echo "  dist - Run production build (node build/index.js)"
        echo "  dev  - Run development mode (pnpm dev)"
        exit 1
        ;;
esac
