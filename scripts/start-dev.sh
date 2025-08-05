#!/bin/bash

echo "🎤 Starting Belly Bear Sings Development Environment..."
echo ""

# Function to check if a port is in use and show what's using it
check_port() {
    local port=$1
    local service=$2
    if lsof -i :$port > /dev/null 2>&1; then
        echo "❌ Port $port is already in use (needed for $service)"
        echo "   Process using port $port:"
        lsof -i :$port | grep LISTEN | head -3
        return 1
    else
        echo "✅ Port $port is available for $service"
        return 0
    fi
}

# Function to check if development processes are already running
check_running_processes() {
    local processes_running=false
    
    # Check for Firebase emulators
    if pgrep -f "firebase emulators" > /dev/null; then
        echo "⚠️  Firebase emulators are already running"
        processes_running=true
    fi
    
    # Check for Vite dev server
    if pgrep -f "vite.*3000" > /dev/null || lsof -i :3000 > /dev/null 2>&1; then
        echo "⚠️  Vite dev server is already running on port 3000"
        processes_running=true
    fi
    
    # Check for any other processes on our ports
    if lsof -i :3001 > /dev/null 2>&1; then
        echo "⚠️  Port 3001 is in use (this should be free)"
        processes_running=true
    fi
    
    if [ "$processes_running" = true ]; then
        echo ""
        echo "🔄 Development environment appears to already be running!"
        echo "   - Main App: http://localhost:3000"
        echo "   - Firebase Emulator UI: http://localhost:4000"
        echo ""
        echo "💡 If you want to restart, first run: pnpm stop"
        echo "   Or manually kill processes: pkill -f 'firebase emulators' && pkill -f 'vite'"
        echo ""
        return 1
    fi
    
    return 0
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

# Check if development environment is already running
echo "🔍 Checking if development environment is already running..."
if ! check_running_processes; then
    exit 1
fi

# Check if required ports are available
echo ""
echo "🔍 Checking port availability..."
ports_available=true

check_port 3000 "Main App" || ports_available=false
check_port 4000 "Firebase Emulator UI" || ports_available=false

# Check for any processes on port 3001 (should be free)
if lsof -i :3001 > /dev/null 2>&1; then
    echo "❌ Port 3001 is in use (this should be free for our app)"
    echo "   Process using port 3001:"
    lsof -i :3001 | grep LISTEN | head -3
    echo "   Killing process on port 3001..."
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

if [ "$ports_available" = false ]; then
    echo ""
    echo "❌ Cannot start development environment - required ports are in use!"
    echo ""
    echo "💡 To fix this, you can:"
    echo "   1. Stop the processes using these ports"
    echo "   2. Or run: pnpm stop"
    echo "   3. Or manually kill: pkill -f 'firebase emulators' && pkill -f 'vite'"
    echo "   4. Then try running this script again"
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
echo "  🔍 Checking if emulators are ready..."
attempts=0
max_attempts=30
while ! curl -s http://localhost:4000 > /dev/null 2>&1; do
    attempts=$((attempts + 1))
    if [ $attempts -ge $max_attempts ]; then
        echo "  ❌ Firebase emulators failed to start after $max_attempts attempts"
        echo "  💡 Check if port 4000 is available and try again"
        exit 1
    fi
    echo "  ⏳ Still waiting for emulators... (attempt $attempts/$max_attempts)"
    sleep 2
done

echo "  ✅ Firebase emulators are running!"

# Wait a bit more for all services to be fully ready
sleep 3

echo ""
echo "🚀 Starting development servers..."
echo ""
echo "📍 Services will be available at:"
echo "   - Main App: http://localhost:3000"
echo "   - Firebase Emulator UI: http://localhost:4000"
echo "   - Storybook: http://localhost:6006 (run 'pnpm storybook' separately)"
echo ""

# Start development server with explicit port
pnpm dev &
DEV_PID=$!

# Wait a moment for the dev server to start
sleep 3

# Verify the dev server is running on the correct port
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "  ❌ Development server failed to start on port 3000"
    echo "  💡 Check if port 3000 is available and try again"
    exit 1
fi

echo "  ✅ Development server is running on port 3000!"

echo ""
echo "✨ Development environment is ready!"
echo ""
echo "📝 Available commands:"
echo "   Ctrl+C - Stop all services"
echo "   pnpm stop - Stop all services"
echo "   Visit http://localhost:3000 to get started"
echo ""
echo "🎯 Sample users available in development mode:"
echo "   - alice@example.com / password123 (Host)"
echo "   - bob@example.com / password123 (Host)"
echo "   - charlie@example.com / password123 (Participant)"
echo ""

# Wait for development servers and keep script running
wait $DEV_PID 