# FitForge - Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the FitForge CrossFit/HIIT Workout Application to production environments. The application consists of a Flask backend API, React web frontend, and React Native mobile application.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Web     │    │  React Native   │    │   Admin Panel   │
│   Frontend      │    │  Mobile App     │    │   (Optional)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Flask API     │
                    │   Backend       │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │   Database      │
                    └─────────────────┘
```

## Prerequisites

### System Requirements

**Minimum Server Specifications:**
- CPU: 2 cores
- RAM: 4GB
- Storage: 20GB SSD
- OS: Ubuntu 20.04+ or CentOS 8+

**Recommended Server Specifications:**
- CPU: 4 cores
- RAM: 8GB
- Storage: 50GB SSD
- OS: Ubuntu 22.04 LTS

### Required Software

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Nginx 1.18+
- SSL Certificate (Let's Encrypt recommended)

### External Services

- **Stripe Account**: For payment processing
- **OpenAI API Key**: For AI workout generation
- **Google Cloud Console**: For Google Calendar integration
- **Microsoft Azure**: For Outlook Calendar integration
- **Domain Name**: For production deployment
- **Email Service**: SendGrid, Mailgun, or similar

## Environment Setup

### 1. Server Preparation

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y python3.11 python3.11-venv python3-pip nodejs npm postgresql postgresql-contrib redis-server nginx certbot python3-certbot-nginx git

# Install PM2 for process management
sudo npm install -g pm2

# Create application user
sudo useradd -m -s /bin/bash fitforge
sudo usermod -aG sudo fitforge
```

### 2. Database Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE fitforge_prod;
CREATE USER fitforge_user WITH PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE fitforge_prod TO fitforge_user;
ALTER USER fitforge_user CREATEDB;
\q

# Configure PostgreSQL
sudo nano /etc/postgresql/14/main/postgresql.conf
# Uncomment and modify:
# listen_addresses = 'localhost'
# max_connections = 100

sudo nano /etc/postgresql/14/main/pg_hba.conf
# Add line:
# local   fitforge_prod   fitforge_user                   md5

# Restart PostgreSQL
sudo systemctl restart postgresql
sudo systemctl enable postgresql
```

### 3. Redis Setup

```bash
# Configure Redis
sudo nano /etc/redis/redis.conf
# Modify:
# bind 127.0.0.1
# maxmemory 256mb
# maxmemory-policy allkeys-lru

# Restart Redis
sudo systemctl restart redis-server
sudo systemctl enable redis-server
```

## Backend Deployment

### 1. Application Setup

```bash
# Switch to application user
sudo su - fitforge

# Clone repository
git clone https://github.com/your-org/fitforge-app.git
cd fitforge-app/backend/crossfit-api

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install production dependencies
pip install gunicorn psycopg2-binary
```

### 2. Environment Configuration

```bash
# Create production environment file
nano .env.production
```

```env
# Flask Configuration
FLASK_ENV=production
SECRET_KEY=your-super-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here

# Database Configuration
DATABASE_URL=postgresql://fitforge_user:secure_password_here@localhost/fitforge_prod

# Redis Configuration
REDIS_URL=redis://localhost:6379/0

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Google Calendar Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/calendar/google/callback

# Microsoft Calendar Configuration
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_REDIRECT_URI=https://yourdomain.com/api/calendar/microsoft/callback

# Email Configuration
MAIL_SERVER=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=apikey
MAIL_PASSWORD=your-sendgrid-api-key

# Security
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 3. Database Migration

```bash
# Initialize database
source venv/bin/activate
export FLASK_APP=src/main.py
export FLASK_ENV=production

# Run migrations (if using Flask-Migrate)
flask db upgrade

# Or create tables directly
python -c "
import sys
sys.path.insert(0, 'src')
from src.main import app
from src.models.user import db
with app.app_context():
    db.create_all()
    print('Database tables created successfully')
"

# Seed initial data
python src/seed_data.py
```

### 4. Gunicorn Configuration

```bash
# Create Gunicorn configuration
nano gunicorn.conf.py
```

```python
# gunicorn.conf.py
import multiprocessing

# Server socket
bind = "127.0.0.1:8000"
backlog = 2048

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 2

# Restart workers
max_requests = 1000
max_requests_jitter = 50
preload_app = True

# Logging
accesslog = "/var/log/fitforge/access.log"
errorlog = "/var/log/fitforge/error.log"
loglevel = "info"

# Process naming
proc_name = "fitforge-api"

# Server mechanics
daemon = False
pidfile = "/var/run/fitforge/fitforge.pid"
user = "fitforge"
group = "fitforge"
tmp_upload_dir = None

# SSL (if terminating SSL at application level)
# keyfile = "/path/to/keyfile"
# certfile = "/path/to/certfile"
```

### 5. Systemd Service

```bash
# Create systemd service file
sudo nano /etc/systemd/system/fitforge-api.service
```

```ini
[Unit]
Description=FitForge API
After=network.target postgresql.service redis.service

[Service]
Type=notify
User=fitforge
Group=fitforge
WorkingDirectory=/home/fitforge/fitforge-app/backend/crossfit-api
Environment=PATH=/home/fitforge/fitforge-app/backend/crossfit-api/venv/bin
EnvironmentFile=/home/fitforge/fitforge-app/backend/crossfit-api/.env.production
ExecStart=/home/fitforge/fitforge-app/backend/crossfit-api/venv/bin/gunicorn --config gunicorn.conf.py src.main:app
ExecReload=/bin/kill -s HUP $MAINPID
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Create log directories
sudo mkdir -p /var/log/fitforge /var/run/fitforge
sudo chown fitforge:fitforge /var/log/fitforge /var/run/fitforge

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable fitforge-api
sudo systemctl start fitforge-api

# Check status
sudo systemctl status fitforge-api
```

## Frontend Deployment

### 1. Build React Application

```bash
# Navigate to frontend directory
cd /home/fitforge/fitforge-app/frontend/crossfit-web

# Install dependencies
npm install

# Create production environment file
nano .env.production
```

```env
REACT_APP_API_URL=https://yourdomain.com/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
REACT_APP_MICROSOFT_CLIENT_ID=your-microsoft-client-id
REACT_APP_ENVIRONMENT=production
```

```bash
# Build for production
npm run build

# Copy build files to web directory
sudo mkdir -p /var/www/fitforge
sudo cp -r build/* /var/www/fitforge/
sudo chown -R www-data:www-data /var/www/fitforge
```

## Nginx Configuration

### 1. SSL Certificate

```bash
# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 2. Nginx Configuration

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/fitforge
```

```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;

# Upstream backend
upstream fitforge_backend {
    server 127.0.0.1:8000;
    keepalive 32;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Frontend static files
    location / {
        root /var/www/fitforge;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API endpoints
    location /api/ {
        # Rate limiting
        limit_req zone=api burst=20 nodelay;
        
        # Authentication endpoints have stricter limits
        location /api/auth/ {
            limit_req zone=auth burst=5 nodelay;
            proxy_pass http://fitforge_backend;
            include /etc/nginx/proxy_params;
        }
        
        proxy_pass http://fitforge_backend;
        include /etc/nginx/proxy_params;
        
        # Proxy headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Block access to sensitive files
    location ~ /\. {
        deny all;
    }
    
    location ~ \.(env|log|conf)$ {
        deny all;
    }
}
```

```bash
# Enable site and restart Nginx
sudo ln -s /etc/nginx/sites-available/fitforge /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## Mobile App Deployment

### 1. Android Build

```bash
# Navigate to Android project
cd /home/fitforge/fitforge-app/android/CrossFitApp

# Install dependencies
npm install

# Create production environment
nano .env.production
```

```env
API_URL=https://yourdomain.com/api
STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key
GOOGLE_CLIENT_ID=your-google-client-id
MICROSOFT_CLIENT_ID=your-microsoft-client-id
ENVIRONMENT=production
```

```bash
# Build APK
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle

# Generate signed APK (requires keystore setup)
cd android
./gradlew assembleRelease

# APK will be available at:
# android/app/build/outputs/apk/release/app-release.apk
```

### 2. iOS Build (macOS required)

```bash
# Install dependencies
cd ios
pod install

# Build for release (requires Xcode)
# Open CrossFitApp.xcworkspace in Xcode
# Archive and upload to App Store Connect
```

## Monitoring and Logging

### 1. Log Management

```bash
# Configure log rotation
sudo nano /etc/logrotate.d/fitforge
```

```
/var/log/fitforge/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 fitforge fitforge
    postrotate
        systemctl reload fitforge-api
    endscript
}
```

### 2. Monitoring Setup

```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Setup basic monitoring script
nano /home/fitforge/monitor.sh
```

```bash
#!/bin/bash
# Basic monitoring script

# Check API health
curl -f http://localhost:8000/health || echo "API health check failed"

# Check database connection
sudo -u postgres psql -d fitforge_prod -c "SELECT 1;" > /dev/null || echo "Database connection failed"

# Check Redis
redis-cli ping > /dev/null || echo "Redis connection failed"

# Check disk space
df -h | awk '$5 > 80 {print "Disk usage warning: " $0}'

# Check memory usage
free -m | awk 'NR==2{printf "Memory usage: %s/%sMB (%.2f%%)\n", $3,$2,$3*100/$2 }'
```

```bash
# Make executable and add to cron
chmod +x /home/fitforge/monitor.sh
crontab -e
# Add: */5 * * * * /home/fitforge/monitor.sh >> /var/log/fitforge/monitor.log 2>&1
```

## Security Hardening

### 1. Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Fail2Ban Setup

```bash
# Install and configure Fail2Ban
sudo apt install -y fail2ban

sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
action = iptables-multiport[name=ReqLimit, port="http,https", protocol=tcp]
logpath = /var/log/nginx/error.log
findtime = 600
bantime = 7200
maxretry = 10
```

```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Database Security

```bash
# Secure PostgreSQL
sudo nano /etc/postgresql/14/main/postgresql.conf
# Set: ssl = on

# Create SSL certificates for PostgreSQL
sudo openssl req -new -x509 -days 365 -nodes -text -out /etc/ssl/certs/server.crt -keyout /etc/ssl/private/server.key -subj "/CN=localhost"
sudo chown postgres:postgres /etc/ssl/private/server.key
sudo chmod 600 /etc/ssl/private/server.key

sudo systemctl restart postgresql
```

## Backup Strategy

### 1. Database Backup

```bash
# Create backup script
nano /home/fitforge/backup_db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/fitforge/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="fitforge_prod"

mkdir -p $BACKUP_DIR

# Create database backup
pg_dump -h localhost -U fitforge_user -d $DB_NAME | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Keep only last 30 days of backups
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +30 -delete

echo "Database backup completed: db_backup_$DATE.sql.gz"
```

```bash
# Make executable and schedule
chmod +x /home/fitforge/backup_db.sh
crontab -e
# Add: 0 2 * * * /home/fitforge/backup_db.sh >> /var/log/fitforge/backup.log 2>&1
```

### 2. Application Backup

```bash
# Create application backup script
nano /home/fitforge/backup_app.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/fitforge/backups"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/home/fitforge/fitforge-app"

mkdir -p $BACKUP_DIR

# Backup application files (excluding node_modules and venv)
tar --exclude='node_modules' --exclude='venv' --exclude='.git' -czf $BACKUP_DIR/app_backup_$DATE.tar.gz -C /home/fitforge fitforge-app

# Keep only last 7 days of app backups
find $BACKUP_DIR -name "app_backup_*.tar.gz" -mtime +7 -delete

echo "Application backup completed: app_backup_$DATE.tar.gz"
```

## Performance Optimization

### 1. Database Optimization

```sql
-- Connect to database and run optimization queries
sudo -u postgres psql -d fitforge_prod

-- Create indexes for better performance
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_workouts_user_id ON workouts(user_id);
CREATE INDEX CONCURRENTLY idx_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX CONCURRENTLY idx_sessions_created_at ON workout_sessions(created_at);

-- Analyze tables
ANALYZE;
```

### 2. Redis Optimization

```bash
# Configure Redis for production
sudo nano /etc/redis/redis.conf
```

```
# Memory optimization
maxmemory 512mb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000

# Network
tcp-keepalive 300
timeout 0
```

### 3. Application Optimization

```python
# Add to Flask app configuration
# src/config.py

class ProductionConfig:
    # Database connection pooling
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 20,
        'pool_recycle': 3600,
        'pool_pre_ping': True,
        'max_overflow': 30
    }
    
    # Caching
    CACHE_TYPE = 'redis'
    CACHE_REDIS_URL = 'redis://localhost:6379/1'
    CACHE_DEFAULT_TIMEOUT = 300
    
    # Session configuration
    SESSION_TYPE = 'redis'
    SESSION_REDIS = redis.from_url('redis://localhost:6379/2')
    SESSION_PERMANENT = False
    SESSION_USE_SIGNER = True
    SESSION_KEY_PREFIX = 'fitforge:'
```

## Deployment Checklist

### Pre-Deployment

- [ ] All environment variables configured
- [ ] SSL certificates obtained and configured
- [ ] Database migrations completed
- [ ] External service integrations tested
- [ ] Backup strategy implemented
- [ ] Monitoring and logging configured
- [ ] Security hardening completed
- [ ] Performance optimization applied

### Deployment

- [ ] Backend API deployed and running
- [ ] Frontend built and served
- [ ] Database connected and accessible
- [ ] Redis cache working
- [ ] Nginx configured and running
- [ ] SSL/HTTPS working
- [ ] API endpoints responding correctly
- [ ] Authentication flow working
- [ ] Payment processing functional
- [ ] Calendar integration working

### Post-Deployment

- [ ] Health checks passing
- [ ] Monitoring alerts configured
- [ ] Backup jobs scheduled
- [ ] Log rotation configured
- [ ] Performance metrics baseline established
- [ ] Documentation updated
- [ ] Team notified of deployment
- [ ] User acceptance testing completed

## Troubleshooting

### Common Issues

**API Not Responding:**
```bash
# Check service status
sudo systemctl status fitforge-api

# Check logs
sudo journalctl -u fitforge-api -f

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

**Database Connection Issues:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
sudo -u postgres psql -d fitforge_prod -c "SELECT version();"

# Check connection limits
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"
```

**SSL Certificate Issues:**
```bash
# Check certificate status
sudo certbot certificates

# Renew certificates
sudo certbot renew --dry-run

# Test SSL configuration
openssl s_client -connect yourdomain.com:443
```

**Performance Issues:**
```bash
# Check system resources
htop
iotop
df -h

# Check database performance
sudo -u postgres psql -d fitforge_prod -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"

# Check Redis performance
redis-cli info stats
```

## Maintenance

### Regular Tasks

**Daily:**
- Monitor system health
- Check error logs
- Verify backup completion

**Weekly:**
- Review performance metrics
- Update security patches
- Clean up old log files

**Monthly:**
- Review and optimize database
- Update dependencies
- Security audit
- Capacity planning review

### Update Procedure

```bash
# 1. Backup current deployment
/home/fitforge/backup_app.sh
/home/fitforge/backup_db.sh

# 2. Pull latest code
cd /home/fitforge/fitforge-app
git pull origin main

# 3. Update backend
cd backend/crossfit-api
source venv/bin/activate
pip install -r requirements.txt

# 4. Run database migrations
flask db upgrade

# 5. Restart services
sudo systemctl restart fitforge-api

# 6. Update frontend
cd ../../frontend/crossfit-web
npm install
npm run build
sudo cp -r build/* /var/www/fitforge/

# 7. Test deployment
curl -f https://yourdomain.com/health
```

## Support and Maintenance

### Monitoring Dashboards

Consider implementing:
- **Grafana + Prometheus**: For detailed metrics
- **ELK Stack**: For log analysis
- **Uptime Robot**: For external monitoring
- **New Relic/DataDog**: For APM

### Support Contacts

- **System Administrator**: admin@yourdomain.com
- **Development Team**: dev@yourdomain.com
- **Emergency Contact**: +1-XXX-XXX-XXXX

### Documentation

Keep updated:
- API documentation
- Deployment procedures
- Incident response playbook
- Recovery procedures

---

This deployment guide provides a comprehensive foundation for deploying FitForge to production. Adjust configurations based on your specific requirements and infrastructure setup.

