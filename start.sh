#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

# Log files
BACKEND_LOG="/tmp/ares-backend.log"
FRONTEND_LOG="/tmp/ares-frontend.log"

# PID files
BACKEND_PID_FILE="/tmp/ares-backend.pid"
FRONTEND_PID_FILE="/tmp/ares-frontend.pid"

# Function to print ASCII art
print_ascii_art() {
    echo -e "${CYAN}${BOLD}"
    cat << "EOF"
    ╔═══════════════════════════════════════════════════════════════╗
    ║                                                               ║
    ║                  █████╗ ██████╗ ███████╗███████╗              ║
    ║                 ██╔══██╗██╔══██╗██╔════╝██╔════╝              ║
    ║                 ███████║██████╔╝█████╗  ███████╗              ║
    ║                 ██╔══██║██╔══██╗██╔══╝  ╚════██║              ║
    ║                 ██║  ██║██║  ██║███████╗███████║              ║
    ║                 ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝              ║
    ║                                                               ║
    ║     ═══════════════════════════════════════════════════════   ║
    ║            Analytics, Reporting & Executions Status           ║
    ║     ═══════════════════════════════════════════════════════   ║
    ║                                                               ║
    ╚═══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}${BOLD}[ARES]${NC} Shutting down services..."
    
    # Kill backend if running
    if [ -f "$BACKEND_PID_FILE" ]; then
        BACKEND_PID=$(cat "$BACKEND_PID_FILE")
        if ps -p "$BACKEND_PID" > /dev/null 2>&1; then
            echo -e "${YELLOW}[BACKEND]${NC} Stopping Spring Boot server (PID: $BACKEND_PID)..."
            kill "$BACKEND_PID" 2>/dev/null
            wait "$BACKEND_PID" 2>/dev/null
        fi
        rm -f "$BACKEND_PID_FILE"
    fi
    
    # Kill frontend if running
    if [ -f "$FRONTEND_PID_FILE" ]; then
        FRONTEND_PID=$(cat "$FRONTEND_PID_FILE")
        if ps -p "$FRONTEND_PID" > /dev/null 2>&1; then
            echo -e "${YELLOW}[FRONTEND]${NC} Stopping Angular dev server (PID: $FRONTEND_PID)..."
            kill "$FRONTEND_PID" 2>/dev/null
            wait "$FRONTEND_PID" 2>/dev/null
        fi
        rm -f "$FRONTEND_PID_FILE"
    fi
    
    # Kill tail processes
    if [ -f "/tmp/ares-tail-backend.pid" ]; then
        TAIL_PID=$(cat "/tmp/ares-tail-backend.pid")
        kill "$TAIL_PID" 2>/dev/null
        rm -f "/tmp/ares-tail-backend.pid"
    fi
    if [ -f "/tmp/ares-tail-frontend.pid" ]; then
        TAIL_PID=$(cat "/tmp/ares-tail-frontend.pid")
        kill "$TAIL_PID" 2>/dev/null
        rm -f "/tmp/ares-tail-frontend.pid"
    fi
    
    # Kill any remaining node/maven processes
    pkill -f "ng serve" 2>/dev/null
    pkill -f "spring-boot:run" 2>/dev/null
    
    echo -e "${GREEN}${BOLD}[ARES]${NC} All services stopped. Goodbye!"
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM EXIT

# Clear screen and print ASCII art
clear
print_ascii_art

echo -e "${WHITE}${BOLD}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}${BOLD}Starting ARES Application${NC}"
echo -e "${WHITE}${BOLD}═══════════════════════════════════════════════════════════════${NC}\n"

# Check if directories exist
if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}${BOLD}[ERROR]${NC} Backend directory not found: $BACKEND_DIR"
    exit 1
fi

if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}${BOLD}[ERROR]${NC} Frontend directory not found: $FRONTEND_DIR"
    exit 1
fi

# Clean up old log files
rm -f "$BACKEND_LOG" "$FRONTEND_LOG"

# Start Backend
echo -e "${BLUE}${BOLD}[BACKEND]${NC} Starting Spring Boot server..."
echo -e "${BLUE}[BACKEND]${NC} Directory: $BACKEND_DIR"
echo -e "${BLUE}[BACKEND]${NC} Log file: $BACKEND_LOG"
echo ""

cd "$BACKEND_DIR" || exit 1

# Start Maven in background with detailed logging
mvn spring-boot:run > "$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!
echo "$BACKEND_PID" > "$BACKEND_PID_FILE"

echo -e "${GREEN}[BACKEND]${NC} Started with PID: $BACKEND_PID"
echo -e "${GREEN}[BACKEND]${NC} Backend will be available at: ${CYAN}http://localhost:8080${NC}\n"

# Start Frontend
echo -e "${MAGENTA}${BOLD}[FRONTEND]${NC} Starting Angular development server..."
echo -e "${MAGENTA}[FRONTEND]${NC} Directory: $FRONTEND_DIR"
echo -e "${MAGENTA}[FRONTEND]${NC} Log file: $FRONTEND_LOG"
echo ""

cd "$FRONTEND_DIR" || exit 1

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}[FRONTEND]${NC} node_modules not found. Installing dependencies..."
    npm install
fi

# Start Angular in background with detailed logging
npm start > "$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!
echo "$FRONTEND_PID" > "$FRONTEND_PID_FILE"

echo -e "${GREEN}[FRONTEND]${NC} Started with PID: $FRONTEND_PID"
echo -e "${GREEN}[FRONTEND]${NC} Frontend will be available at: ${CYAN}http://localhost:4200${NC}\n"

# Wait a moment for processes to start
sleep 2

# Display logs with colors
echo -e "${WHITE}${BOLD}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}${BOLD}Live Logs (Press Ctrl+C to stop all services)${NC}"
echo -e "${WHITE}${BOLD}═══════════════════════════════════════════════════════════════${NC}\n"

# Function to tail logs with colors using named pipes for better merging
tail_backend() {
    tail -f "$BACKEND_LOG" 2>/dev/null | while IFS= read -r line; do
        echo -e "${BLUE}[BACKEND]${NC} $line"
    done
}

tail_frontend() {
    tail -f "$FRONTEND_LOG" 2>/dev/null | while IFS= read -r line; do
        echo -e "${MAGENTA}[FRONTEND]${NC} $line"
    done
}

# Start tailing both logs in background
tail_backend &
TAIL_BACKEND_PID=$!

tail_frontend &
TAIL_FRONTEND_PID=$!

# Store tail PIDs for cleanup
echo "$TAIL_BACKEND_PID" > /tmp/ares-tail-backend.pid
echo "$TAIL_FRONTEND_PID" > /tmp/ares-tail-frontend.pid

# Wait for user interrupt (Ctrl+C)
wait

