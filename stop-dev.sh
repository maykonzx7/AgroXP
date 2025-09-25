#!/bin/bash

# Stop the development servers for both frontend and backend
echo "Stopping AgroXP development servers..."

# Kill backend processes
BACKEND_PIDS=$(pgrep -f "npm.*dev.*backend")
if [ ! -z "$BACKEND_PIDS" ]; then
    echo "Stopping backend server (PIDs: $BACKEND_PIDS)..."
    kill $BACKEND_PIDS
else
    echo "No backend server found running."
fi

# Kill frontend processes
FRONTEND_PIDS=$(pgrep -f "npm.*dev.*frontend")
if [ ! -z "$FRONTEND_PIDS" ]; then
    echo "Stopping frontend server (PIDs: $FRONTEND_PIDS)..."
    kill $FRONTEND_PIDS
else
    echo "No frontend server found running."
fi

# Wait a moment for processes to terminate
sleep 2

# Force kill if still running
BACKEND_PIDS=$(pgrep -f "npm.*dev.*backend")
if [ ! -z "$BACKEND_PIDS" ]; then
    echo "Force stopping backend server (PIDs: $BACKEND_PIDS)..."
    kill -9 $BACKEND_PIDS
fi

FRONTEND_PIDS=$(pgrep -f "npm.*dev.*frontend")
if [ ! -z "$FRONTEND_PIDS" ]; then
    echo "Force stopping frontend server (PIDs: $FRONTEND_PIDS)..."
    kill -9 $FRONTEND_PIDS
fi

echo "Servers stopped."