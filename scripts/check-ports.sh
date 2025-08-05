#!/bin/bash

echo "🔍 Checking Belly Bear Sings Port Status..."
echo ""

# Function to check if a port is in use and show what's using it
check_port_detailed() {
    local port=$1
    local service=$2
    
    if lsof -i :$port > /dev/null 2>&1; then
        echo "❌ Port $port is in use (needed for $service)"
        echo "   Process using port $port:"
        lsof -i :$port | grep LISTEN | head -5
        echo ""
        return 1
    else
        echo "✅ Port $port is available for $service"
        return 0
    fi
}

# Function to check if development processes are running
check_running_processes() {
    local processes_running=false
    
    echo "🔍 Checking for running development processes..."
    
    # Check for Firebase emulators
    if pgrep -f "firebase emulators" > /dev/null; then
        echo "⚠️  Firebase emulators are running"
        processes_running=true
    fi
    
    # Check for Vite dev server
    if pgrep -f "vite" > /dev/null; then
        echo "⚠️  Vite development server is running"
        processes_running=true
    fi
    
    # Check for PNPM dev processes
    if pgrep -f "pnpm dev" > /dev/null; then
        echo "⚠️  PNPM development processes are running"
        processes_running=true
    fi
    
    if [ "$processes_running" = true ]; then
        echo ""
        echo "🔄 Development environment appears to be running!"
        echo "   - Main App: http://localhost:3000"
        echo "   - Firebase Emulator UI: http://localhost:4000"
        echo ""
        return 1
    else
        echo "✅ No development processes are currently running"
        return 0
    fi
}

# Check all required ports
ports_available=true

check_port_detailed 3000 "Main App" || ports_available=false
check_port_detailed 3001 "Rogue App (should be free)" || ports_available=false
check_port_detailed 4000 "Firebase Emulator UI" || ports_available=false
check_port_detailed 8080 "Firebase Emulator" || ports_available=false

echo ""
check_running_processes

echo ""
if [ "$ports_available" = true ]; then
    echo "🎯 All ports are available! You can start the development environment."
    echo ""
    echo "📝 Available commands:"
    echo "   pnpm start        - Start full environment (Firebase + Apps)"
    echo "   pnpm start:quick  - Start just the apps"
    echo "   pnpm stop         - Stop all services"
else
    echo "⚠️  Some ports are in use. You may need to stop existing processes."
    echo ""
    echo "💡 To stop all development services:"
    echo "   pnpm stop"
    echo ""
    echo "💡 To manually stop specific processes:"
    echo "   pkill -f 'firebase emulators'  # Stop Firebase"
    echo "   pkill -f 'pnpm dev'           # Stop PNPM dev servers"
    echo "   pkill -f 'vite'               # Stop Vite servers"
    echo ""
    echo "💡 To force kill all processes on these ports:"
    echo "   lsof -ti:3000,3001,4000,8080 | xargs kill -9 2>/dev/null || true"
fi

echo "" 