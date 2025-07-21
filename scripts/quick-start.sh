#!/bin/bash

echo "🎤 Belly Bear Sings - Quick Start"
echo "================================="
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build shared packages
echo "🔧 Building shared packages..."
cd packages/shared && pnpm build
cd ../firebase-config && pnpm build
cd ../ui && pnpm build
cd ../..

# Create environment files
echo "📝 Setting up environment files..."
for app in apps/public-website apps/singer-pwa apps/host-app; do
    echo 'VITE_FIREBASE_API_KEY=demo-key
VITE_FIREBASE_AUTH_DOMAIN=demo-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=demo-project
VITE_FIREBASE_STORAGE_BUCKET=demo-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_YOUTUBE_API_KEY=demo-youtube-key
VITE_USE_FIREBASE_EMULATORS=true' > "$app/.env.local"
done

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 Starting development environment..."
echo ""
echo "📍 Services will be available at:"
echo "   - Public Website: http://localhost:3000"
echo "   - Singer PWA: http://localhost:3001"
echo "   - Host App: http://localhost:3002"
echo "   - Firebase Emulator UI: http://localhost:4000"
echo ""
echo "⚡ Starting Firebase emulators..."
echo "   📝 Open TWO new terminals and run:"
echo "   📱 Terminal 1: 'pnpm dev' - to start all apps"
echo "   🌱 Terminal 2: 'pnpm firebase:seed' - to add sample data"
echo ""
echo "🎯 To test the app:"
echo "   1. Wait for emulators to start"
echo "   2. In terminal 2, run: pnpm firebase:seed"
echo "   3. In terminal 1, run: pnpm dev"
echo "   4. Go to http://localhost:3001"
echo "   5. Enter party code: demo-party-123"
echo ""

# Start Firebase emulators
cd firebase && firebase emulators:start 