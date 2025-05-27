
# Docker Guide

This guide covers Docker setup and management for the Placement Platform.

## Prerequisites

- **Docker** - [Download](https://docs.docker.com/get-docker/)
- **Docker Compose** - Usually included with Docker Desktop

## Quick Docker Setup

### Automated Setup (Recommended)
```bash
# Navigate to backend directory
cd backend

# Run automated setup script
npm run docker:setup
```

This script will:
- Create `.env` file from template
- Build and start all services
- Initialize the database
- Set up sample data

### Manual Docker Setup

#### 1. Environment Configuration
```bash
# Navigate to backend directory
cd backend

# Create environment file
cp .env.docker .env
```

#### 2. Build and Start Services
```bash
# Build services
docker-compose build

# Start services
docker-compose up -d

# Initialize database
docker-compose exec backend npm run init-db
```

## Docker Commands

### Service Management
```bash
# Start all services
npm run docker:up
# OR
docker-compose up -d

# Stop all services
npm run docker:down
# OR
docker-compose down

# Restart services
docker-compose restart

# View service status
docker-compose ps
```

### Logs and Monitoring
```bash
# View all logs
npm run docker:logs
# OR
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f postgres

# Follow logs in real-time
docker-compose logs -f --tail=100
```

### Database Management
```bash
# Access PostgreSQL directly
docker-compose exec postgres psql -U placement_user -d placement_platform

# Backup database
docker-compose exec postgres pg_dump -U placement_user placement_platform > backup.sql

# Restore database
docker-compose exec -T postgres psql -U placement_user placement_platform < backup.sql

# Reset database (WARNING: Deletes all data)
docker-compose down -v
docker-compose up -d
docker-compose exec backend npm run init-db
```

### Development with Docker

#### Development Mode
```bash
# Start only database for local development
npm run docker:dev

# This starts PostgreSQL and provides connection info
# Then run backend locally with:
npm run dev
```

#### Production Mode
```bash
# Use production docker-compose file
docker-compose -f docker-compose.prod.yml up -d
```

## Docker Configuration Files

### docker-compose.yml (Development)
- PostgreSQL on port 5432
- Backend on port 5000
- Development environment variables
- Volume mounting for logs

### docker-compose.prod.yml (Production)
- Environment variables from .env file
- Production-optimized settings
- Separate volumes for production data

### Dockerfile
- Multi-stage build for optimization
- Non-root user for security
- Health checks included
- Production dependencies only

## Container Details

### PostgreSQL Container
- **Image**: postgres:15-alpine
- **Port**: 5432
- **Database**: placement_platform
- **User**: placement_user
- **Data Persistence**: Docker volume `postgres_data`

### Backend Container
- **Image**: Custom Node.js image
- **Port**: 5000
- **Health Check**: Endpoint monitoring
- **Dependencies**: Waits for PostgreSQL

## Troubleshooting Docker Issues

### Services Won't Start
```bash
# Check service status
docker-compose ps

# View detailed logs
docker-compose logs

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Database Connection Issues
```bash
# Check if PostgreSQL is ready
docker-compose exec postgres pg_isready -U placement_user

# Restart PostgreSQL
docker-compose restart postgres

# Check PostgreSQL logs
docker-compose logs postgres
```

### Clean Reset
```bash
# Remove all containers, volumes, and images
npm run docker:clean
# OR
docker-compose down -v --remove-orphans
docker system prune -f

# Then restart setup
npm run docker:setup
```

### Port Conflicts
If ports 5000 or 5432 are already in use:

1. Stop conflicting services
2. Or modify ports in `docker-compose.yml`:
```yaml
ports:
  - "5001:5000"  # Use port 5001 instead of 5000
```

## Performance Optimization

### Resource Limits
Add resource limits to `docker-compose.yml`:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

### Volume Optimization
- Use named volumes for better performance
- Regular cleanup of unused volumes:
```bash
docker volume prune
```

## Security Considerations

- Change default passwords in production
- Use environment-specific `.env` files
- Regularly update base images
- Monitor container logs for security events
