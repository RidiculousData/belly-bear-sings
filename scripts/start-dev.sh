#!/bin/bash

echo "🎤 Starting Belly Bear Sings Development Environment..."
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
    echo "🛑 Shutting down development environment..."
    pkill -f "firebase emulators"
    pkill -f "pnpm dev"
    pkill -f "vite"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if required ports are available
echo "🔍 Checking port availability..."
ports_available=true

check_port 3000 "Main App" || ports_available=false
check_port 4000 "Firebase Emulator UI" || ports_available=false

if [ "$ports_available" = false ]; then
    echo ""
    echo "❌ Cannot start development environment - required ports are in use!"
    echo ""
    echo "💡 To fix this, you can:"
    echo "   1. Stop the processes using these ports"
    echo "   2. Or run: pkill -f 'firebase emulators' && pkill -f 'pnpm dev' && pkill -f 'vite'"
    echo "   3. Then try running this script again"
    echo ""
    echo "🔍 To see what's using these ports:"
    echo "   lsof -i :3000 -i :4000"
    echo ""
    exit 1
fi

echo ""
echo "🎯 All required ports are available!"
echo ""

# Check if .env.local exists in root
echo "📋 Setting up environment files..."
if [ ! -f ".env.local" ]; then
    echo "  Creating .env.local for main app..."
    echo 'VITE_FIREBASE_API_KEY=demo-key
VITE_FIREBASE_AUTH_DOMAIN=demo-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=demo-project
VITE_FIREBASE_STORAGE_BUCKET=demo-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_YOUTUBE_API_KEY=demo-youtube-key
VITE_USE_FIREBASE_EMULATORS=true' > ".env.local"
fi

echo ""
echo "🔥 Starting Firebase emulators..."
cd firebase

# Start Firebase emulators in the background
firebase emulators:start &
FIREBASE_PID=$!

# Wait for emulators to be ready
echo "  ⏳ Waiting for emulators to start..."
sleep 5

# Check if emulators are running by testing the UI port
while ! curl -s http://localhost:4000 > /dev/null; do
    echo "  ⏳ Still waiting for emulators..."
    sleep 2
done

echo "  ✅ Firebase emulators are running!"

# Wait a bit more for all services to be fully ready
sleep 3

echo ""
echo "🌱 Seeding database with sample data..."
cd ..
pnpm firebase:seed || echo "  ⚠️  Seeding encountered an issue, but continuing..."

echo ""
echo "🚀 Starting development servers..."
echo ""
echo "📍 Services will be available at:"
echo "   - Main App: http://localhost:3000"
echo "   - Firebase Emulator UI: http://localhost:4000"
echo "   - Storybook: http://localhost:6006 (run 'pnpm storybook' separately)"
echo ""

# Start development server
pnpm dev &
DEV_PID=$!

echo "✨ Development environment is ready!"
echo ""
echo "📝 Available commands:"
echo "   Ctrl+C - Stop all services"
echo "   Visit http://localhost:3000 to get started"
echo ""
echo "🎯 Sample users available in development mode:"
echo "   - alice@example.com / password123 (Host)"
echo "   - bob@example.com / password123 (Host)"
echo "   - charlie@example.com / password123 (Participant)"
echo ""

# Wait for development servers and keep script running
wait $DEV_PID 