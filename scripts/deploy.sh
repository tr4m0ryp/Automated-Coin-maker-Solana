#!/usr/bin/env bash

echo "Deploying MemeMint Token..."

# Run the create-and-mint script
npx ts-node src/createAndMint.ts
echo "Deployment script completed."
