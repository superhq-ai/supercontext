#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

setup_environment() {
    print_status "Setting up environment..."
    
    if [ ! -f .env ]; then
        if [ -f env.example ]; then
            cp env.example .env
            print_warning "Created .env from env.example. Please edit it with your configuration."
        else
            print_error "No .env file found and no env.example available."
            exit 1
        fi
    fi
    
    print_success "Environment setup completed"
}

# Function to build images
build_images() {
    print_status "Building Docker images..."
    
    if [ "$1" = "production" ]; then
        docker-compose -f docker-compose.prod.yml --env-file .env build
    else
        docker-compose build
    fi
    
    print_success "Images built successfully"
}

# Function to start services
start_services() {
    print_status "Starting services..."
    
    if [ "$1" = "production" ]; then
        docker-compose -f docker-compose.prod.yml --env-file .env up -d
    else
        docker-compose up -d
    fi
    
    print_success "Services started successfully"
}

# Function to run migrations
run_migrations() {
    print_status "Running database migrations..."
    
    if [ "$1" = "production" ]; then
        docker-compose -f docker-compose.prod.yml --env-file .env exec -T api bun run db:migrate
    else
        docker-compose exec -T api bun run db:migrate
    fi
    
    print_success "Migrations completed successfully"
}

# Function to check health
check_health() {
    print_status "Checking service health..."
    
    # Wait for services to be ready
    sleep 10
    
    if [ "$1" = "production" ]; then
        docker-compose -f docker-compose.prod.yml --env-file .env ps
    else
        docker-compose ps
    fi
    
    print_success "Health check completed"
}

# Function to show logs
show_logs() {
    print_status "Showing service logs..."
    
    if [ "$1" = "production" ]; then
        docker-compose -f docker-compose.prod.yml --env-file .env logs -f
    else
        docker-compose logs -f
    fi
}

# Function to stop services
stop_services() {
    print_status "Stopping services..."
    
    if [ "$1" = "production" ]; then
        docker-compose -f docker-compose.prod.yml --env-file .env down
    else
        docker-compose down
    fi
    
    print_success "Services stopped successfully"
}

# Function to clean up
cleanup() {
    print_status "Cleaning up unused Docker resources..."
    
    docker system prune -f
    docker volume prune -f
    
    print_success "Cleanup completed"
}

# Function to show help
show_help() {
    echo "SuperContext Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND] [ENVIRONMENT]"
    echo ""
    echo "Commands:"
    echo "  deploy [dev|prod]    Deploy the application"
    echo "  start [dev|prod]     Start services"
    echo "  stop [dev|prod]      Stop services"
    echo "  restart [dev|prod]   Restart services"
    echo "  logs [dev|prod]      Show service logs"
    echo "  migrate [dev|prod]   Run database migrations"
    echo "  build [dev|prod]     Build Docker images"
    echo "  cleanup              Clean up unused Docker resources"
    echo "  health [dev|prod]    Check service health"
    echo "  help                 Show this help message"
    echo ""
    echo "Environments:"
    echo "  dev                  Development environment (default)"
    echo "  prod                 Production environment"
    echo ""
    echo "Examples:"
    echo "  $0 deploy dev        Deploy development environment"
    echo "  $0 deploy prod       Deploy production environment"
    echo "  $0 logs prod         Show production logs"
}

# Main script logic
case "${1:-help}" in
    "deploy")
        ENV="${2:-dev}"
        check_prerequisites
        setup_environment
        build_images "$ENV"
        start_services "$ENV"
        run_migrations "$ENV"
        check_health "$ENV"
        print_success "Deployment completed successfully!"
        ;;
    "start")
        ENV="${2:-dev}"
        check_prerequisites
        start_services "$ENV"
        ;;
    "stop")
        ENV="${2:-dev}"
        stop_services "$ENV"
        ;;
    "restart")
        ENV="${2:-dev}"
        stop_services "$ENV"
        start_services "$ENV"
        ;;
    "logs")
        ENV="${2:-dev}"
        show_logs "$ENV"
        ;;
    "migrate")
        ENV="${2:-dev}"
        run_migrations "$ENV"
        ;;
    "build")
        ENV="${2:-dev}"
        build_images "$ENV"
        ;;
    "cleanup")
        cleanup
        ;;
    "health")
        ENV="${2:-dev}"
        check_health "$ENV"
        ;;
    "help"|*)
        show_help
        ;;
esac 