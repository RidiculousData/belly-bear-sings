#!/bin/bash

echo "🎤 Starting Belly Bear Sings Apps (Quick Start - No Firebase)..."
echo ""

# Function to check if a port is in use
check_port() {
    local port=$1
    local service=$2
    if lsof -i :$port > /dev/null 2>&1; then
        echo "❌ Port $port is already in use (needed for $service)"
        return 1
    else
        echo "✅ Port $port is available for $service"
        return 0
    fi
}

# Function to kill background processes on script exit
cleanup() {
    echo ""
    echo "🛑 Shutting down development servers..."
    pkill -f "pnpm dev"
    pkill -f "vite"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if required ports are available (only app ports, not Firebase)
echo "🔍 Checking port availability..."
ports_available=true

check_port 3000 "Main App" || ports_available=false
check_port 3001 "Singer PWA" || ports_available=false

if [ "$ports_available" = false ]; then
    echo ""
    echo "❌ Cannot start apps - required ports are in use!"
    echo ""
    echo "💡 To fix this, you can:"
    echo "   1. Stop the processes using these ports"
    echo "   2. Or run: pkill -f 'pnpm dev' && pkill -f 'vite'"
    echo "   3. Then try running this script again"
    echo ""
    echo "🔍 To see what's using these ports:"
    echo "   lsof -i :3000 -i :3001"
    echo ""
    exit 1
fi

echo ""
echo "🎯 All required ports are available!"
echo ""

# Check if .env.local exists in apps
echo "📋 Setting up environment files..."
for app in apps/main-app apps/singer-pwa; do
    if [ ! -f "$app/.env.local" ]; then
        echo "  Creating .env.local for $app..."
        echo 'VITE_FIREBASE_API_KEY=demo-key
VITE_FIREBASE_AUTH_DOMAIN=demo-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=demo-project
VITE_FIREBASE_STORAGE_BUCKET=demo-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_YOUTUBE_API_KEY=demo-youtube-key
VITE_USE_FIREBASE_EMULATORS=true' > "$app/.env.local"
    fi
done

echo ""
echo "🚀 Starting development servers..."
echo ""
echo "📍 Services will be available at:"
echo "   - Main App (Host & Public): http://localhost:3000"
echo "   - Singer PWA (Guest): http://localhost:3001"
echo ""
echo "⚠️  Note: Firebase emulators are not running in quick start mode."
echo "   For full functionality, use: pnpm start"
echo ""

# Start all development servers
pnpm dev &
DEV_PID=$!

echo "✨ Development servers are ready!"
echo ""
echo "📝 Available commands:"
echo "   Ctrl+C - Stop all services"
echo "   Visit http://localhost:3000 to get started"
echo ""

# Wait for development servers and keep script running
wait $DEV_PID 