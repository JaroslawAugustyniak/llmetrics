# Deployment Guide

## Prerequisites

1. **GitHub Repository Secrets**
   - `DEPLOY_HOST` - Server IP or hostname
   - `DEPLOY_USER` - SSH user (e.g., `deploy`)
   - `DEPLOY_SSH_KEY` - Private SSH key (add public key to `~/.ssh/authorized_keys`)
   - `DEPLOY_PORT` (optional) - SSH port, defaults to 22

2. **Server Setup**
   ```bash
   # On your server
   mkdir -p /opt/starter
   cd /opt/starter
   
   # Create .env file with secrets
   cat > .env <<EOF
   DB_NAME=starter
   DB_USER=starter_user
   DB_PASSWORD=your_strong_password
   APP_KEY=base64:YOUR_LARAVEL_KEY
   EOF
   
   # Login to GitHub Container Registry
   docker login ghcr.io -u your_github_username
   ```

3. **Docker & Docker Compose installed on server**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.x.x/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

## CI/CD Workflow

### Automatic Deployment

1. **Push to `main` branch**
   - Triggers build workflow
   - Builds Docker image: `ghcr.io/username/starter:main`
   - Pushes to GitHub Container Registry
   - Runs tests
   - If tests pass and it's a push to `main`: deploys to server

2. **Pull Requests**
   - Runs tests
   - Does NOT deploy

### Manual Deployment

```bash
# SSH into server
ssh deploy@your-server

# Navigate to project
cd /opt/starter

# Pull latest images
docker compose pull

# Start services
docker compose up -d

# Run migrations
docker compose exec backend php artisan migrate --force

# Clear caches
docker compose exec backend php artisan config:cache
docker compose exec backend php artisan route:cache
docker compose exec backend php artisan view:cache
```

## Troubleshooting

### Check logs
```bash
docker compose logs -f backend
docker compose logs -f queue-worker
docker compose logs -f frontend
```

### Migrate from MySQL to PostgreSQL
```bash
# Backup MySQL data (if migrating)
# Run migrations on new PostgreSQL
docker compose exec backend php artisan migrate --force

# Seed if needed
docker compose exec backend php artisan db:seed
```

### Restart services
```bash
docker compose restart
# or specific service:
docker compose restart backend
```

### Database issues
```bash
# Connect to database
docker compose exec postgres psql -U starter_user -d starter

# List tables
\dt

# Exit
\q
```

## Environment Variables

Update `.env` on the server for production settings:

```env
# Docker
DB_NAME=starter
DB_USER=starter_user
DB_PASSWORD=production_password

# Laravel (generate with: docker compose exec backend php artisan key:generate)
APP_KEY=base64:xxxxx
APP_DEBUG=false
APP_ENV=production

# Cache
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=database
```

## Rollback

To rollback to a previous version:

```bash
cd /opt/starter

# List available image tags
docker compose pull --dry-run

# Manually specify image tag in docker-compose.yml
# e.g., image: ghcr.io/username/starter:main-sha123

docker compose up -d
docker compose exec backend php artisan migrate --force
```
