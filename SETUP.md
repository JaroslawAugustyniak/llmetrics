# LLMetrics Setup Guide

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Git

### 1. Clone and Setup

```bash
git clone git@github.com:yourusername/llmetrics.git
cd llmetrics

# Create environment file
cp .env.example .env

# Or set your own values
cat > .env <<EOF
DB_NAME=starter
DB_USER=starter_user
DB_PASSWORD=your_secure_password
APP_KEY=base64:your_laravel_key
EOF
```

### 2. Generate Laravel Key

```bash
docker compose run --rm backend php artisan key:generate
```

Update the `APP_KEY` in `.env` with the generated value.

### 3. Start Services

```bash
# Build and start containers
docker compose up -d

# Run migrations
docker compose exec backend php artisan migrate

# Seed database (optional)
docker compose exec backend php artisan db:seed
```

### 4. Access Application

- **Backend API**: http://api.starter.localhost:8000
- **Frontend**: http://starter.localhost
- **PostgreSQL**: localhost:5432

## Development Commands

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

### Database

```bash
# Connect to database
docker compose exec postgres psql -U starter_user -d starter

# Run migrations
docker compose exec backend php artisan migrate

# Roll back migrations
docker compose exec backend php artisan migrate:rollback

# Seed database
docker compose exec backend php artisan db:seed
```

### Artisan Commands

```bash
# Tinker (interactive shell)
docker compose exec backend php artisan tinker

# Clear caches
docker compose exec backend php artisan cache:clear
docker compose exec backend php artisan config:clear
docker compose exec backend php artisan route:clear
docker compose exec backend php artisan view:clear

# Queue work
docker compose exec backend php artisan queue:work
```

### Frontend

```bash
# Install dependencies
docker compose exec frontend npm install

# Build
docker compose exec frontend npm run build

# Type check
docker compose exec frontend npm run typecheck
```

## Testing

### Backend (Laravel)
```bash
# Run all tests
docker compose exec backend php artisan test

# Run specific test
docker compose exec backend php artisan test tests/Feature/ExampleTest.php

# With coverage
docker compose exec backend php artisan test --coverage
```

### Frontend (Next.js)
```bash
# Run linter
docker compose exec frontend npm run lint

# Run tests
docker compose exec frontend npm test
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for production setup and CI/CD pipeline details.

## Troubleshooting

### Database Connection Errors
```bash
# Check PostgreSQL is running and healthy
docker compose ps postgres

# Verify environment variables
docker compose config

# Check logs
docker compose logs postgres
```

### Permission Errors
```bash
# Fix file permissions
docker compose exec backend chown -R www-data:www-data storage bootstrap/cache
```

### Build Errors
```bash
# Rebuild without cache
docker compose build --no-cache

# Then restart
docker compose up -d
```

### Clear Everything and Start Fresh
```bash
# Stop all containers
docker compose down

# Remove volumes (WARNING: deletes data)
docker compose down -v

# Rebuild and restart
docker compose up -d --build
```

## Environment Variables

Create `.env` file in project root:

```env
# Docker Compose Configuration

# Database (PostgreSQL)
DB_NAME=starter              # Database name
DB_USER=starter_user         # Database user
DB_PASSWORD=starter_password # Database password

# Laravel
APP_KEY=base64:xxxxx         # Generated with `php artisan key:generate`
APP_DEBUG=true              # Set to false in production
APP_ENV=local               # local, staging, production
```

## Network Configuration

The application uses `nginx-proxy-network` which should be created manually:

```bash
docker network create nginx-proxy-network
```

Or use the included `init-git.sh` script if available.

## Additional Resources

- [Laravel 11 Documentation](https://laravel.com/docs/11)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
