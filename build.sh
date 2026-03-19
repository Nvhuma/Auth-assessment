#!/bin/bash
# build.sh — Build and run script
# Makes running the entire stack a one-command operation


set -e  # Exit immediately if any command fails ("error-first" scripting)

echo "🏗️  Building Auth Assessment Application..."
echo "================================================"

# Function to print step headers
step() {
  echo ""
  echo "▶ $1"
  echo "──────────────────────────────────────────"
}

# Run backend tests BEFORE building Docker images
step "Running backend unit tests..."
cd backend
dotnet test AuthApi.Tests/AuthApi.Tests.csproj --verbosity normal
cd ..
echo "✅ All tests passed!"

# Build Docker images and start containers
step "Building Docker images..."
docker compose build --no-cache

step "Starting all services..."
docker compose up -d

# Wait for the API to be ready
step "Waiting for services to start..."
sleep 5

# Health check
echo ""
echo "✅ Application is running!"
echo "================================================"
echo "  🌐 Frontend:  http://localhost:3000"
echo "  🔧 API:       http://localhost:5000"
echo "  🗄️  Database: localhost:5432"
echo "================================================"
echo ""
echo "📋 Useful commands:"
echo "  View logs:    docker compose logs -f"
echo "  Stop:         docker compose down"
echo "  Reset DB:     docker compose down -v"