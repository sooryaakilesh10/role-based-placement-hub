
# Deployment Guide

This guide covers production deployment strategies for the Placement Platform.

## Production Environment Setup

### Server Requirements

#### Minimum Specifications
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **OS**: Ubuntu 20.04+ or CentOS 8+

#### Recommended Specifications
- **CPU**: 4 cores
- **RAM**: 8GB
- **Storage**: 50GB SSD
- **Network**: High-speed internet connection

### Software Requirements
- Docker & Docker Compose
- SSL certificates (Let's Encrypt recommended)
- Reverse proxy (Nginx recommended)
- Monitoring tools (optional but recommended)

## Docker Production Deployment

### 1. Prepare Production Environment

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
```

### 2. Clone and Configure Application

```bash
# Clone repository
git clone <your-repository-url>
cd placement-platform/backend

# Create production environment file
cp .env.docker .env.prod
```

### 3. Configure Production Environment Variables

Edit `.env.prod` with production values:

```env
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=placement_platform
DB_USER=placement_user
DB_PASSWORD=STRONG_PRODUCTION_PASSWORD

# JWT Configuration
JWT_SECRET=VERY_SECURE_PRODUCTION_JWT_SECRET_MINIMUM_32_CHARACTERS
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=5000
NODE_ENV=production

# CORS Configuration
FRONTEND_URL=https://yourdomain.com
```

### 4. Deploy with Docker Compose

```bash
# Start production services
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Initialize database
docker-compose -f docker-compose.prod.yml exec backend npm run init-db

# Check service status
docker-compose -f docker-compose.prod.yml ps
```

## Nginx Reverse Proxy Setup

### 1. Install Nginx

```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 2. Configure Nginx

Create `/etc/nginx/sites-available/placement-platform`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    # Frontend (React app)
    location / {
        root /var/www/placement-platform;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

### 3. Enable Site and SSL

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/placement-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test SSL renewal
sudo certbot renew --dry-run
```

## Frontend Production Build

### 1. Build React Application

```bash
# Navigate to frontend directory
cd ../

# Install dependencies
npm install

# Build for production
npm run build
```

### 2. Deploy Frontend Files

```bash
# Copy build files to Nginx directory
sudo mkdir -p /var/www/placement-platform
sudo cp -r dist/* /var/www/placement-platform/
sudo chown -R www-data:www-data /var/www/placement-platform
```

## Database Backup Strategy

### 1. Automated Backups

Create backup script `/opt/backup-db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="placement_platform_${DATE}.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
docker-compose -f /path/to/docker-compose.prod.yml exec -T postgres pg_dump -U placement_user placement_platform > $BACKUP_DIR/$BACKUP_FILE

# Compress backup
gzip $BACKUP_DIR/$BACKUP_FILE

# Remove backups older than 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: ${BACKUP_FILE}.gz"
```

### 2. Schedule Backups

```bash
# Make script executable
sudo chmod +x /opt/backup-db.sh

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /opt/backup-db.sh" | sudo crontab -
```

## Monitoring and Logging

### 1. Application Logs

```bash
# View application logs
docker-compose -f docker-compose.prod.yml logs -f backend

# View database logs
docker-compose -f docker-compose.prod.yml logs -f postgres
```

### 2. System Monitoring

#### Install monitoring tools
```bash
# Install htop for system monitoring
sudo apt install htop -y

# Install Docker stats
docker stats --no-stream
```

#### Log rotation
Create `/etc/logrotate.d/placement-platform`:

```
/var/log/nginx/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 www-data www-data
    postrotate
        systemctl reload nginx
    endscript
}
```

## Security Hardening

### 1. Firewall Configuration

```bash
# Install UFW
sudo apt install ufw -y

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH, HTTP, HTTPS
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# Enable firewall
sudo ufw enable
```

### 2. Database Security

```bash
# Change default passwords
# Update .env.prod with strong passwords

# Restrict database access
# Ensure PostgreSQL only accepts connections from backend container
```

### 3. Application Security

- Use strong JWT secrets (minimum 32 characters)
- Enable rate limiting in production
- Regular security updates
- Monitor access logs

## Performance Optimization

### 1. Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX idx_companies_name ON companies(company_name);
CREATE INDEX idx_companies_officer ON companies(assigned_officer_id);
CREATE INDEX idx_pending_status ON pending_updates(status);
```

### 2. Application Optimization

- Enable gzip compression in Nginx
- Use connection pooling for database
- Implement caching where appropriate
- Monitor and optimize slow queries

## Maintenance Procedures

### 1. Regular Updates

```bash
# Update Docker images
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Update system packages
sudo apt update && sudo apt upgrade -y
```

### 2. Health Checks

```bash
# Check service status
docker-compose -f docker-compose.prod.yml ps

# Check disk space
df -h

# Check memory usage
free -h

# Check application health
curl -f http://localhost:5000/api/health
```

## Disaster Recovery

### 1. Backup Restoration

```bash
# Stop services
docker-compose -f docker-compose.prod.yml down

# Restore database from backup
docker-compose -f docker-compose.prod.yml up -d postgres
sleep 10
gunzip -c /opt/backups/placement_platform_YYYYMMDD_HHMMSS.sql.gz | \
  docker-compose -f docker-compose.prod.yml exec -T postgres psql -U placement_user placement_platform

# Restart all services
docker-compose -f docker-compose.prod.yml up -d
```

### 2. Migration Strategy

1. Test deployment in staging environment
2. Create full backup before deployment
3. Deploy during low-traffic periods
4. Monitor application after deployment
5. Have rollback plan ready

This deployment guide ensures a robust, secure, and scalable production environment for your Placement Platform.
