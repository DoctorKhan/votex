#!/bin/bash
# run-install.sh - Installation and build script for the Votex project

set -e  # Exit on any error

# Colors for pretty output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions for colored output
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Display banner
echo "===================================="
echo "      Votex Installation Script     "
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed. Please install Node.js before continuing."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 16 ]; then
    log_warning "Node.js version is $(node -v). This project works best with Node.js 16 or higher."
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Installation cancelled. Please upgrade Node.js and try again."
        exit 0
    fi
fi

# Ensure we're in the project directory
PROJECT_DIR="$(dirname "$(readlink -f "$0")")"
cd "$PROJECT_DIR"
log_info "Working in directory: $(pwd)"

# Install dependencies
log_info "Installing dependencies..."
npm ci

if [ $? -eq 0 ]; then
    log_success "Dependencies installed successfully"
else
    log_error "Failed to install dependencies"
    log_info "Trying with npm install instead of npm ci..."
    npm install
    
    if [ $? -eq 0 ]; then
        log_success "Dependencies installed successfully with npm install"
    else
        log_error "Failed to install dependencies. Please check your npm configuration."
        exit 1
    fi
fi

# Install missing critters package (required for CSS optimization in Next.js)
log_info "Installing additional required dependencies..."
npm install --save-dev critters

if [ $? -eq 0 ]; then
    log_success "Additional dependencies installed successfully"
else
    log_error "Failed to install additional dependencies"
    exit 1
fi

# Check for .env file
if [ -f .env ]; then
    log_info ".env file found. This will be used for environment variables."
    log_info "Make sure it contains all required variables including GROQ_API_KEY."
else
    log_warning ".env file not found! The repository should include a .env file."
    log_info "Using .env.example as a fallback..."
    
    if [ -f .env.example ]; then
        cp .env.example .env
        log_success "Created .env from .env.example. Update with your actual API keys before running."
    else
        log_error "No .env or .env.example file found! Environment variables will not be available."
        log_info "You may need to create a .env file manually before running the application."
    fi
fi

# Build the project
log_info "Building the project..."
npm run build

if [ $? -eq 0 ]; then
    log_success "Project built successfully!"
else
    log_error "Failed to build the project"
    exit 1
fi

# Print success message
log_success "Installation and build completed successfully!"
log_info "You can now run the project with: npm run dev"
log_info "For production deployment, follow the instructions in stable-coolify-guide.md"

# Make script executable
chmod +x "$0"

exit 0