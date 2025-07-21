#!/bin/bash

echo "🛑 Stopping Belly Bear Sings Development Environment..."
echo ""

# Function to kill processes and check if they're stopped
kill_processes() {
    local pattern=$1
    local name=$2
    
    echo "  🔍 Stopping $name..."
    
    # Kill processes matching the pattern
    pkill -f "$pattern" 2>/dev/null
    
    # Wait a moment for processes to stop
    sleep 2
    
    # Check if any processes are still running
    if pgrep -f "$pattern" > /dev/null 2>&1; then
        echo "  ⚠️  Some $name processes are still running, force killing..."
        pkill -9 -f "$pattern" 2>/dev/null
        sleep 1
    fi
    
    if pgrep -f "$pattern" > /dev/null 2>&1; then
        echo "  ❌ Failed to stop $name"
        return 1
    else
        echo "  ✅ $name stopped"
        return 0
    fi
}

# Stop all services
kill_processes "firebase emulators" "Firebase Emulators"
kill_processes "pnpm dev" "PNPM Development Servers"
kill_processes "vite" "Vite Development Servers"

echo ""
echo "🔍 Checking if ports are now free..."

# Check if ports are now available
ports_freed=true

for port in 3000 4000; do
    if lsof -i :$port > /dev/null 2>&1; then
        echo "  ⚠️  Port $port is still in use"
        ports_freed=false
    else
        echo "  ✅ Port $port is now free"
    fi
done

echo ""
if [ "$ports_freed" = true ]; then
    echo "✅ All development services stopped successfully!"
else
    echo "⚠️  Some ports are still in use. You may need to manually stop remaining processes."
    echo ""
    echo "🔍 To see what's still running:"
    echo "   lsof -i :3000 -i :4000"
fi

echo "" 