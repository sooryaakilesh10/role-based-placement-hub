
#!/bin/bash

# Development Docker Script
set -e

echo "🔧 Starting development environment..."

# Start only the database for local development
docker-compose up -d postgres

echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

# Check if PostgreSQL is ready
until docker-compose exec postgres pg_isready -U placement_user -d placement_platform; do
    echo "Waiting for PostgreSQL..."
    sleep 2
done

echo "✅ PostgreSQL is ready!"
echo "🗄️ Database connection: localhost:5432"
echo "📝 Run 'npm run init-db' to initialize the database"
echo "🚀 Run 'npm run dev' to start the backend in development mode"
