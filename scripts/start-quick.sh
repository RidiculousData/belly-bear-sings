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

# Check if .env.local exists in root
echo "📋 Setting up environment files..."
if [ ! -f ".env.local" ]; then
    echo "  Creating .env.local..."
    echo "  ⚠️  Please configure your Firebase Cloud credentials in .env.local"
    echo 'VITE_TENANT=dev
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_YOUTUBE_API_KEY=your_youtube_api_key' > ".env.local"
    echo "  ✅ Created .env.local - Please update with your Firebase credentials"
fi

echo ""
echo "🌐 Using Firebase Cloud (Production)"
echo "   Tenant: ${VITE_TENANT:-dev} (set VITE_TENANT in .env.local)"
echo ""

echo ""
echo "🚀 Starting development server..."
echo ""
echo "📍 Services will be available at:"
echo "   - Main App: http://localhost:3000"
echo ""
echo "🌐 All data operations use Firebase Cloud"
echo "   Tenant: ${VITE_TENANT:-dev}"
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