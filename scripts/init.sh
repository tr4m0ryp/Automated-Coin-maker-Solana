#!/usr/bin/env bash
echo "Initializing MemeMint Project..."

# Install NPM dependencies
echo "Installing NPM dependencies..."
npm install

# optional; checks if typeScript is installed global
if ! command -v tsc &> /dev/null
then
    echo "TypeScript could not be found globally. Installing TypeScript..."
    npm install -g typescript
fi

echo "Initialization complete."
