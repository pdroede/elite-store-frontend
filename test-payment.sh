#!/bin/bash

# Elite Store - Test Script
# Automated testing for payment flow

echo "🧪 Elite Store - Payment Testing Script"
echo "======================================"

# Check if server is running
echo "📡 Checking server status..."
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ Server is running on port 3001"
else
    echo "❌ Server is not running. Starting server..."
    cd server && node server.js &
    sleep 3
    if curl -s http://localhost:3001/api/health > /dev/null; then
        echo "✅ Server started successfully"
    else
        echo "❌ Failed to start server"
        exit 1
    fi
fi

echo ""
echo "🛒 Test Instructions:"
echo "===================="
echo "1. Open the website in your browser"
echo "2. Add products to cart"
echo "3. Proceed to checkout"
echo "4. Use test card: 4242 4242 4242 4242"
echo "5. Complete payment and check confirmation page"
echo ""
echo "📱 Test Card Numbers:"
echo "Success: 4242 4242 4242 4242"
echo "Decline: 4000 0000 0000 0002"
echo "3D Secure: 4000 0025 0000 3155"
echo ""
echo "🌐 Opening website..."

# Open the website
if command -v open &> /dev/null; then
    open index.html
elif command -v xdg-open &> /dev/null; then
    xdg-open index.html
else
    echo "Please open index.html manually in your browser"
fi

echo ""
echo "🎯 Quick Test Links:"
echo "Main Site: file://$(pwd)/index.html"
echo "Order Test: file://$(pwd)/pages/test-confirmation.html"
echo "API Health: http://localhost:3001/api/health"
echo ""
echo "✨ Ready for testing! Use the test card numbers above."
