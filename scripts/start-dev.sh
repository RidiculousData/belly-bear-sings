#!/bin/bash

echo "🎤 Starting Belly Bear Sings Development Environment (Firebase Cloud)..."
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
        echo ""
        echo "💡 If you want to restart, first run: pnpm stop"
        echo "   Or manually kill processes: pkill -f 'vite'"
        echo ""
        return 1
    fi
    
    return 0
}

# Function to kill background processes on script exit
cleanup() {
    echo ""
    echo "🛑 Shutting down development environment..."
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
    echo "   3. Or manually kill: pkill -f 'vite'"
    echo "   4. Then try running this script again"
    echo ""
    echo "🔍 To see what's using these ports:"
    echo "   lsof -i :3000"
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

# Check if Firebase credentials are configured
if grep -q "your_firebase_api_key" .env.local 2>/dev/null; then
    echo ""
    echo "⚠️  WARNING: Firebase credentials not configured!"
    echo "   Please update .env.local with your Firebase Cloud credentials"
    echo "   The application will not work without proper Firebase configuration"
    echo ""
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
echo "   - Storybook: http://localhost:6006 (run 'pnpm storybook' separately)"
echo ""

# Start development server
pnpm vite &
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
echo "🌐 All data operations use Firebase Cloud"
echo "   Tenant: ${VITE_TENANT:-dev}"
echo "   Data is stored under: tenants/${VITE_TENANT:-dev}/"
echo ""

# Wait for development servers and keep script running
wait $DEV_PID 