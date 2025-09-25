#!/bin/bash

# Start the development servers for both frontend and backend
echo "Starting AgroXP development servers..."

# Check if the processes are already running
if pgrep -f "npm.*dev.*backend" > /dev/null || pgrep -f "npm.*dev.*frontend" > /dev/null; then
    echo "Development servers are already running. Please stop them first."
    exit 1
fi

# Start backend server
echo "Starting backend server..."
cd /home/maycolaz/AgroXP/backend
npm run dev > /tmp/agroxp-backend.log 2>&1 &
BACKEND_PID=$!

# Start frontend server
echo "Starting frontend server..."
cd /home/maycolaz/AgroXP/frontend
npm run dev > /tmp/agroxp-frontend.log 2>&1 &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Servers started successfully!"
echo "Frontend will be available at http://localhost:5173"
echo "Backend API will be available at http://localhost:3001"
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID