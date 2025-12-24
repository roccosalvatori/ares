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

# Function to print ASCII art
print_ascii_art() {
    echo -e "${CYAN}${BOLD}"
    cat << "EOF"

    ╔═══════════════════════════════════════════════════════════════════════════════════════════════════════╗
    ║                                                                                                       ║
    ║                  ███████████████╗ ████████████████╗ █████████████████╗█████████████████╗              ║
    ║                 ██╔════════════██╗██╔════════════██╗██╔══════════════╝██╔══════════════╝              ║
    ║                 █████████████████║████████████████╔╝███████████████╗  █████████████████╗              ║
    ║                 ██╔════════════██║██╔════════════██╗██╔════════════╝  ╚══════════════██║              ║
    ║                 ██║            ██║██║            ██║█████████████████╗█████████████████║              ║
    ║                 ╚═╝            ╚═╝╚═╝            ╚═╝╚════════════════╝╚════════════════╝              ║
    ║                                                                                                       ║
    ║     ═════════════════════════════════════════════════════════════════════════════════════════════     ║
    ║                               Analytics, Reporting & Executions Status                                ║
    ║     ═════════════════════════════════════════════════════════════════════════════════════════════     ║
    ║                                                                                                       ║
    ╚═══════════════════════════════════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}${BOLD}[ARES]${NC} Shutting down containers..."
    cd "$SCRIPT_DIR" || exit 1
    docker compose down
    echo -e "${GREEN}${BOLD}[ARES]${NC} All containers stopped. Goodbye!"
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM EXIT

# Clear screen and print ASCII art
clear
print_ascii_art

echo -e "${WHITE}${BOLD}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}${BOLD}Starting ARES Application (Docker Compose)${NC}"
echo -e "${WHITE}${BOLD}═══════════════════════════════════════════════════════════════${NC}\n"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}${BOLD}[ERROR]${NC} Docker is not installed or not in PATH."
    echo -e "${YELLOW}[INFO]${NC} Please install Docker: https://www.docker.com/get-started"
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo -e "${RED}${BOLD}[ERROR]${NC} Docker Compose is not available."
    echo -e "${YELLOW}[INFO]${NC} Please install Docker Compose (v2.0+): https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if docker-compose.yml exists
if [ ! -f "$SCRIPT_DIR/docker-compose.yml" ]; then
    echo -e "${RED}${BOLD}[ERROR]${NC} docker-compose.yml not found in: $SCRIPT_DIR"
    exit 1
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo -e "${RED}${BOLD}[ERROR]${NC} Docker daemon is not running."
    echo -e "${YELLOW}[INFO]${NC} Please start Docker Desktop or Docker daemon."
    exit 1
fi

# Change to script directory
cd "$SCRIPT_DIR" || exit 1

# Check if containers are already running
if docker compose ps | grep -q "Up"; then
    echo -e "${YELLOW}[WARNING]${NC} Some containers are already running."
    echo -e "${YELLOW}[INFO]${NC} Stopping existing containers..."
    docker compose down
fi

# Check for .env file and load environment variables
if [ -f "$SCRIPT_DIR/.env" ]; then
    echo -e "${CYAN}[INFO]${NC} Loading environment variables from .env file..."
    export $(cat "$SCRIPT_DIR/.env" | grep -v '^#' | xargs)
else
    echo -e "${YELLOW}[INFO]${NC} No .env file found. Using default values from docker-compose.yml"
    echo -e "${CYAN}[INFO]${NC} To customize configuration, create a .env file in the project root."
fi

# Set default Redis password if not set
REDIS_PASSWORD="${REDIS_PASSWORD:-change-me-redis-password}"

# Build and start all services
echo -e "${BLUE}${BOLD}[DOCKER]${NC} Building and starting containers..."
echo -e "${BLUE}[DOCKER]${NC} This may take a few minutes on first run..."
echo ""

# Build and start in detached mode first
docker compose up -d --build

# Check if containers started successfully
if [ $? -ne 0 ]; then
    echo -e "${RED}${BOLD}[ERROR]${NC} Failed to start containers. Check the logs above for details."
    exit 1
fi

# Wait a moment for containers to initialize
echo -e "${GREEN}[DOCKER]${NC} Containers started. Waiting for services to be ready..."
sleep 5

# Clear Redis cache
echo -e "${YELLOW}[REDIS]${NC} Clearing Redis cache..."
# Wait a bit more for Redis to be fully ready
sleep 2
if docker exec ares-redis redis-cli -a "$REDIS_PASSWORD" FLUSHALL &> /dev/null; then
    echo -e "${GREEN}[REDIS]${NC} Redis cache cleared successfully"
else
    echo -e "${YELLOW}[REDIS]${NC} Warning: Could not clear Redis cache (Redis may still be starting up)"
    echo -e "${YELLOW}[REDIS]${NC} Cache will be cleared automatically when Redis is ready"
fi

# Check container status
echo -e "\n${CYAN}${BOLD}Container Status:${NC}"
docker compose ps

# Display service URLs
echo -e "\n${WHITE}${BOLD}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}Services are starting up!${NC}"
echo -e "${WHITE}${BOLD}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}[FRONTEND]${NC} Will be available at: ${CYAN}http://localhost${NC}"
echo -e "${GREEN}[BACKEND]${NC}  Will be available at: ${CYAN}http://localhost:8080/api${NC}"
echo -e "${GREEN}[HEALTH]${NC}   Health check at:      ${CYAN}http://localhost:8080/api/health${NC}"
echo -e "${WHITE}${BOLD}═══════════════════════════════════════════════════════════════${NC}\n"

# Display logs with colors
echo -e "${WHITE}${BOLD}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}${BOLD}Live Logs (Press Ctrl+C to stop all services)${NC}"
echo -e "${WHITE}${BOLD}═══════════════════════════════════════════════════════════════${NC}\n"

# Function to tail logs with colors
tail_logs() {
    docker compose logs -f 2>/dev/null | while IFS= read -r line; do
        if [[ $line == *"ares-backend"* ]] || [[ $line == *"backend"* ]]; then
            echo -e "${BLUE}[BACKEND]${NC} $line"
        elif [[ $line == *"ares-frontend"* ]] || [[ $line == *"frontend"* ]]; then
            echo -e "${MAGENTA}[FRONTEND]${NC} $line"
        elif [[ $line == *"ares-redis"* ]] || [[ $line == *"redis"* ]]; then
            echo -e "${YELLOW}[REDIS]${NC} $line"
        else
            echo -e "${WHITE}[DOCKER]${NC} $line"
        fi
    done
}

# Start tailing logs
tail_logs
