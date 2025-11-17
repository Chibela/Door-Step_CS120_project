#!/bin/bash
# Quick start script for frontend

echo "🚀 Starting ServeDash Frontend..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📥 Installing dependencies (this may take a few minutes)..."
    npm install
fi

# Run the dev server
echo ""
echo "✅ Starting Vite dev server on http://localhost:3000"
echo ""
npm run dev

