
# Troubleshooting Guide

This guide helps resolve common issues with the Placement Platform.

## Database Issues

### PostgreSQL Connection Failed

**Symptoms:**
- Backend fails to start
- "Connection refused" errors
- Database timeout errors

**Solutions:**

#### For Local Development:
```bash
# Check if PostgreSQL is running
sudo service postgresql status

# Start PostgreSQL if stopped
sudo service postgresql start

# Check if database exists
psql -U postgres -l | grep placement_platform

# Create database if missing
psql -U postgres -c "CREATE DATABASE placement_platform;"
```

#### For Docker Setup:
```bash
# Check container status
docker-compose ps

# Check PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL container
docker-compose restart postgres

# Check if PostgreSQL is ready
docker-compose exec postgres pg_isready -U placement_user
```

### Database Tables Not Found

**Symptoms:**
- "relation does not exist" errors
- Backend API returns 500 errors

**Solutions:**
```bash
# Reinitialize database tables
npm run init-db

# For Docker setup
docker-compose exec backend npm run init-db

# If still failing, reset database
# WARNING: This deletes all data
psql -U postgres -c "DROP DATABASE placement_platform;"
psql -U postgres -c "CREATE DATABASE placement_platform;"
npm run init-db
```

### Permission Denied Errors

**Symptoms:**
- "permission denied for table" errors
- User authentication issues

**Solutions:**
```bash
# Connect to PostgreSQL
psql -U postgres placement_platform

# Grant proper permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO placement_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO placement_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO placement_user;
```

## Backend Issues

### Backend Won't Start

**Symptoms:**
- "Error: listen EADDRINUSE :::5000"
- "Cannot find module" errors
- Environment variable errors

**Solutions:**

#### Port Already in Use:
```bash
# Find process using port 5000
lsof -i :5000
# OR
netstat -tulpn | grep :5000

# Kill the process
kill -9 <PID>

# Or use different port in .env
PORT=5001
```

#### Missing Dependencies:
```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# Check for peer dependency issues
npm ls
```

#### Environment Variables:
```bash
# Ensure .env file exists
ls -la .env

# Check required variables are set
cat .env | grep -E "(DB_|JWT_|PORT)"

# Copy from example if missing
cp .env.example .env
```

### JWT Token Issues

**Symptoms:**
- "Invalid token" errors
- Authentication failures
- "Token expired" messages

**Solutions:**

#### Check JWT Secret:
```bash
# Ensure JWT_SECRET is set and not empty
echo $JWT_SECRET
# OR check in .env file
grep JWT_SECRET .env
```

#### Clear Browser Storage:
```javascript
// Open browser console and run:
localStorage.clear();
sessionStorage.clear();
// Then refresh the page
```

#### Regenerate Tokens:
- Logout and login again
- Check token expiration in JWT_EXPIRES_IN setting

### API Endpoints Not Working

**Symptoms:**
- 404 Not Found errors
- CORS errors
- 500 Internal Server Error

**Solutions:**

#### CORS Issues:
```bash
# Check FRONTEND_URL in .env
grep FRONTEND_URL .env

# Should match your frontend URL exactly
FRONTEND_URL=http://localhost:5173
```

#### Route Not Found:
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Check route registration in server.js
# Ensure all route files are properly imported
```

## Frontend Issues

### Frontend Won't Start

**Symptoms:**
- "Module not found" errors
- Build failures
- Dependency conflicts

**Solutions:**

#### Clean Installation:
```bash
# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
npm install
```

#### Node Version Issues:
```bash
# Check Node.js version
node --version

# Should be v16 or higher
# Use nvm to switch versions if needed
nvm use 18
```

### API Connection Issues

**Symptoms:**
- "Network Error" in browser console
- API calls failing
- Authentication not working

**Solutions:**

#### Check API Base URL:
```typescript
// In src/lib/api.ts, verify:
const API_BASE_URL = 'http://localhost:5000/api';

// Should match your backend URL
```

#### Check Backend Status:
```bash
# Test backend directly
curl http://localhost:5000/api/health

# Check if CORS is configured properly
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://localhost:5000/api/companies
```

### Authentication Problems

**Symptoms:**
- Stuck on login page
- "Unauthorized" errors
- User roles not working

**Solutions:**

#### Clear Auth State:
```javascript
// Browser console:
localStorage.removeItem('token');
localStorage.removeItem('user');
location.reload();
```

#### Check Default Users:
```bash
# Verify default users exist
psql -U postgres placement_platform -c "SELECT email, role FROM users;"

# Should show:
# admin@placement.com | Admin
# manager@placement.com | Manager
# officer@placement.com | Officer
```

## Docker Issues

### Docker Services Won't Start

**Symptoms:**
- "Container exited with code 1"
- "Network not found" errors
- Health check failures

**Solutions:**

#### Check Docker Status:
```bash
# Verify Docker is running
docker info

# Check service status
docker-compose ps

# View logs for specific service
docker-compose logs backend
docker-compose logs postgres
```

#### Network Issues:
```bash
# Remove and recreate networks
docker-compose down
docker network prune -f
docker-compose up -d
```

#### Permission Issues:
```bash
# Fix Docker permissions
sudo chown -R $USER:$USER .
sudo chmod +x scripts/*.sh
```

### Container Build Failures

**Symptoms:**
- "Build failed" errors
- "No space left on device"
- Dockerfile syntax errors

**Solutions:**

#### Clean Docker System:
```bash
# Remove unused containers and images
docker system prune -a -f

# Remove all stopped containers
docker container prune -f

# Remove unused volumes
docker volume prune -f
```

#### Rebuild Containers:
```bash
# Force rebuild without cache
docker-compose build --no-cache

# Remove and recreate containers
docker-compose down --remove-orphans
docker-compose up -d --force-recreate
```

## Permission and Role Issues

### User Cannot Access Features

**Symptoms:**
- "Access denied" messages
- Missing menu items
- 403 Forbidden errors

**Solutions:**

#### Check User Role:
```sql
-- Connect to database
psql -U postgres placement_platform

-- Check user role
SELECT id, name, email, role FROM users WHERE email = 'user@example.com';

-- Update role if needed
UPDATE users SET role = 'Admin' WHERE email = 'user@example.com';
```

#### Verify Role-Based Routes:
- Admin: Full access to all features
- Manager: Companies, approvals, reports (no user management)
- Officer: Limited to editing companies (requires approval)

### Pending Approvals Not Working

**Symptoms:**
- Officer changes not creating pending updates
- Approval buttons not working
- Updates not reflecting after approval

**Solutions:**

#### Check Database Tables:
```sql
-- Verify pending_updates table exists
\dt pending_updates

-- Check pending records
SELECT * FROM pending_updates WHERE status = 'pending';

-- Check for foreign key constraints
\d pending_updates
```

#### Test Approval Workflow:
1. Login as Officer
2. Edit a company
3. Login as Manager/Admin
4. Check Pending Approvals page
5. Approve/reject the change

## Performance Issues

### Slow Database Queries

**Symptoms:**
- Long page load times
- API timeouts
- High CPU usage

**Solutions:**

#### Add Database Indexes:
```sql
-- Add indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(company_name);
CREATE INDEX IF NOT EXISTS idx_companies_officer ON companies(assigned_officer_id);
CREATE INDEX IF NOT EXISTS idx_pending_status ON pending_updates(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

#### Monitor Database Performance:
```sql
-- Check slow queries (PostgreSQL)
SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 5;
```

### High Memory Usage

**Symptoms:**
- System slowdown
- Out of memory errors
- Container restarts

**Solutions:**

#### Monitor Resource Usage:
```bash
# Check system resources
htop

# Check Docker container resources
docker stats

# Check disk space
df -h
```

#### Optimize Database Connections:
```javascript
// In config/database.js, adjust pool settings:
const pool = new Pool({
  max: 10,           // Reduce max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## Getting Help

### Log Collection

When reporting issues, collect these logs:

#### Backend Logs:
```bash
# Local development
npm run dev > backend.log 2>&1

# Docker setup
docker-compose logs backend > backend.log
```

#### Frontend Logs:
```bash
# Development server logs
npm run dev > frontend.log 2>&1

# Browser console errors (F12 -> Console)
```

#### Database Logs:
```bash
# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log

# Docker PostgreSQL logs
docker-compose logs postgres > postgres.log
```

### Environment Information

Include this information when seeking help:

```bash
# System information
uname -a
node --version
npm --version
docker --version
docker-compose --version

# Database version
psql --version

# Application status
docker-compose ps
curl -I http://localhost:5000/api/health
```

### Common Error Patterns

#### "Cannot read property of undefined"
- Usually indicates missing data or incorrect API response format
- Check network tab in browser dev tools
- Verify API endpoint is returning expected data structure

#### "ECONNREFUSED"
- Service is not running or not accessible
- Check if backend is started and on correct port
- Verify firewall settings and network connectivity

#### "ENOENT: no such file or directory"
- Missing files or incorrect file paths
- Check if all required files exist
- Verify file permissions

If none of these solutions work, please check the GitHub issues or create a new issue with detailed logs and error messages.
