#!/bin/bash
set -e

echo "🚀 Setting up environment..."

# Navigate to backend
cd backend
npm install
npm run init-db || echo "DB already initialized"
cd ..

# Navigate to frontend
cd frontend
npm install
cd ..

echo "✅ Setup complete. You can now run:"
echo "   - npm run dev (frontend)"
echo "   - npm start (backend)"
