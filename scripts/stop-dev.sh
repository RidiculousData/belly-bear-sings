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

# Function to kill processes on specific ports
kill_port_processes() {
    local port=$1
    local name=$2
    
    if lsof -i :$port > /dev/null 2>&1; then
        echo "  🔍 Stopping processes on port $port ($name)..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 1
        
        if lsof -i :$port > /dev/null 2>&1; then
            echo "  ❌ Failed to stop processes on port $port"
            return 1
        else
            echo "  ✅ Port $port is now free"
            return 0
        fi
    else
        echo "  ✅ Port $port is already free"
        return 0
    fi
}

# Stop all services
kill_processes "firebase emulators" "Firebase Emulators"
kill_processes "pnpm dev" "PNPM Development Servers"
kill_processes "vite" "Vite Development Servers"
kill_processes "concurrently" "Concurrently Processes"

echo ""
echo "🔍 Checking and freeing up ports..."

# Kill any processes on our specific ports
ports_freed=true

kill_port_processes 3000 "Main App" || ports_freed=false
kill_port_processes 3001 "Rogue App" || ports_freed=false
kill_port_processes 4000 "Firebase Emulator UI" || ports_freed=false
kill_port_processes 8080 "Firebase Emulator" || ports_freed=false

echo ""
if [ "$ports_freed" = true ]; then
    echo "✅ All development services stopped successfully!"
    echo "🎯 All ports (3000, 3001, 4000, 8080) are now free"
else
    echo "⚠️  Some ports are still in use. You may need to manually stop remaining processes."
    echo ""
    echo "🔍 To see what's still running:"
    echo "   lsof -i :3000 -i :3001 -i :4000 -i :8080"
    echo ""
    echo "💡 To force kill all remaining processes:"
    echo "   lsof -ti:3000,3001,4000,8080 | xargs kill -9 2>/dev/null || true"
fi

echo "" 