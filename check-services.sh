#!/bin/bash

echo "Checking AgroXP Services..."

# Check if backend is running
echo "Checking backend service..."
curl -s http://localhost:3001/api/health > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Backend service is running"
else
    echo "❌ Backend service is not running"
fi

# Check if frontend is running
echo "Checking frontend service..."
curl -s http://localhost:8081/login > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Frontend service is running"
else
    echo "❌ Frontend service is not running"
fi

echo ""
echo "Service URLs:"
echo "  Frontend: http://localhost:8081"
echo "  Backend: http://localhost:3001"
echo ""
echo "To test registration:"
echo "  1. Open http://localhost:8081/register in your browser"
echo "  2. Or open the test form: file://$(pwd)/test-registration-form.html"