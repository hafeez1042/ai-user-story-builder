#!/bin/bash

# Story Builder v3 - Installation Script
echo "🚀 Installing Story Builder v3..."

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if ! node -e "process.exit(require('semver').gte('$NODE_VERSION', '$REQUIRED_VERSION') ? 0 : 1)" 2>/dev/null; then
    echo "❌ Node.js version $NODE_VERSION is installed, but version $REQUIRED_VERSION or higher is required."
    exit 1
fi

echo "✅ Node.js version $NODE_VERSION detected"

# Install all dependencies using npm workspaces
echo "📦 Installing dependencies for all workspaces..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ All dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "✅ Created .env file from template"
    echo "📝 Please edit .env file and configure your Azure DevOps settings"
else
    echo "✅ Environment file already exists"
fi

# Check if Ollama is installed
if command -v ollama &> /dev/null; then
    echo "✅ Ollama is installed"
    
    # Check if any models are available
    MODELS=$(ollama list 2>/dev/null | grep -v "NAME" | wc -l)
    if [ $MODELS -gt 0 ]; then
        echo "✅ Ollama models are available"
    else
        echo "⚠️  No Ollama models found. Run: ollama pull deepseek-r1:14b"
    fi
else
    echo "⚠️  Ollama is not installed. Please install from https://ollama.ai"
fi

echo ""
echo "🎉 Installation complete!"
echo ""
echo "To start development:"
echo "  npm run dev"
echo ""
echo "To run individual services:"
echo "  npm run dev:backend    # Backend only"
echo "  npm run dev:frontend   # Frontend only"
echo ""
echo "To build for production:"
echo "  npm run build"
echo ""