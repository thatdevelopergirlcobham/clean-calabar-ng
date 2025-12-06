#!/bin/bash

echo "🧹 Cleaning Vite cache..."
rm -rf node_modules/.vite

echo "🧹 Cleaning dist..."
rm -rf dist

echo "✅ Cache cleared! Now restart your dev server:"
echo "   npm run dev"
