#!/bin/bash

# dev.sh - Script to run both server and client for Gemini Multimodal Live Demo
# Usage: ./dev.sh [setup|dev|client|server]

set -e

# Check if python3.12 is installed
check_python() {
  if ! command -v python3.12 &> /dev/null; then
    echo "⚠️  Python 3.12 is not installed."
    echo "MacOS: brew install python@3.12"
    echo "Linux: Follow instructions for your distribution"
    echo "Windows: Download from python.org"
    exit 1
  fi
}

setup_server() {
  echo "🔧 Setting up server environment..."
  cd server
  
  # Create Python virtual environment if it doesn't exist
  if [ ! -d "venv" ]; then
    python3.12 -m venv venv
  fi
  
  # Activate virtual environment and install dependencies
  source venv/bin/activate
  pip install -r requirements.txt
  
  # Run the init command to set up environment variables
  python sesame.py init
  
  # Return to project root
  cd ..
}

setup_client() {
  echo "🔧 Setting up client environment..."
  cd client
  npm install
  cd ..
  
  # Initialize client environment
  cd server
  source venv/bin/activate
  python sesame.py init-client
  cd ..
}

run_setup() {
  check_python
  setup_server
  setup_client
  echo "✅ Setup complete! Run './dev.sh dev' to start the application."
}

run_server() {
  echo "🚀 Starting server..."
  cd server
  source venv/bin/activate
  python sesame.py run
}

run_client() {
  echo "🚀 Starting client..."
  cd client
  npm run dev
}

# Main script logic
case "$1" in
  setup)
    run_setup
    ;;
  server)
    run_server
    ;;
  client)
    run_client
    ;;
  dev)
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
      echo "⚠️  npm is not installed. Please install Node.js."
      exit 1
    fi
    
    echo "🚀 Starting both server and client..."
    npm run dev
    ;;
  *)
    echo "Gemini Multimodal Live Demo Development Script"
    echo "Usage: ./dev.sh [setup|dev|client|server]"
    echo ""
    echo "Commands:"
    echo "  setup  - Install dependencies and set up environment"
    echo "  dev    - Run both client and server concurrently"
    echo "  server - Run only the server"
    echo "  client - Run only the client"
    ;;
esac 