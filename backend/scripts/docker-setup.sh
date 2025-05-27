
#!/bin/bash

# Docker Setup Script for Placement Platform Backend
set -e

echo "🐳 Setting up Placement Platform with Docker..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file from template
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.docker .env
    echo "✅ .env file created. Please update it with your preferred settings."
else
    echo "📝 .env file already exists."
fi

# Create logs directory
mkdir -p logs

# Build and start services
echo "🔨 Building and starting Docker services..."
docker-compose down --remove-orphans
docker-compose build --no-cache
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Services are running!"
    
    # Initialize database
    echo "🗄️ Initializing database..."
    sleep 5
    docker-compose exec backend npm run init-db
    
    echo "🎉 Setup complete!"
    echo "📱 Frontend should connect to: http://localhost:5000"
    echo "🗄️ Database is running on: localhost:5432"
    echo "👀 View logs with: docker-compose logs -f"
else
    echo "❌ Services failed to start. Check logs with: docker-compose logs"
    exit 1
fi
