#!/bin/bash
# Quick start script for backend

echo "🚀 Starting Door Step Food Truck Backend..."
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies if needed
if [ ! -f "venv/.installed" ]; then
    echo "📥 Installing dependencies..."
    pip install -r requirements.txt
    touch venv/.installed
fi

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    echo "FLASK_SECRET_KEY=$(openssl rand -hex 32)" > .env
    echo "FLASK_ENV=development" >> .env
    echo "FLASK_DEBUG=True" >> .env
fi

# Run the server
echo ""
echo "✅ Starting Flask server on http://localhost:5000"
echo ""
python app.py

