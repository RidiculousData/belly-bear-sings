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

# Check all required ports
ports_available=true

check_port_detailed 3000 "Main App" || ports_available=false
check_port_detailed 3001 "Singer PWA" || ports_available=false  
check_port_detailed 4000 "Firebase Emulator UI" || ports_available=false

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
fi

echo "" 