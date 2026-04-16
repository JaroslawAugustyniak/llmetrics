# LLMetrics

Modern full-stack application with Laravel 11 backend, Next.js 20 frontend, and PostgreSQL database.

## 🚀 Quick Start

```bash
# Clone repository
git clone git@github.com:yourusername/llmetrics.git
cd llmetrics

# Setup environment
cp .env.example .env

# Start services
docker compose up -d

# Initialize database
docker compose exec backend php artisan migrate

# Access application
# Frontend: http://starter.localhost
# API: http://api.starter.localhost:8000
```

## 📋 Project Structure

```
llmetrics/
├── backend/              # Laravel 11 API
│   ├── app/
│   ├── config/
│   ├── database/
│   ├── routes/
│   └── tests/
├── frontend/             # Next.js 20 Application
│   ├── app/
│   ├── components/
│   ├── public/
│   └── ...
├── docker-compose.yml    # Service orchestration
├── Dockerfile            # PHP 8.2 container
├── .github/workflows/    # CI/CD pipelines
├── SETUP.md             # Development guide
└── DEPLOYMENT.md        # Production guide
```

## 🛠️ Stack

- **Backend**: Laravel 11 (PHP 8.2)
- **Frontend**: Next.js 20 (Node.js 20)
- **Database**: PostgreSQL 16
- **Cache**: Redis (optional)
- **Queue**: Database driver
- **CI/CD**: GitHub Actions

## 📚 Documentation

- [Setup Guide](./SETUP.md) - Local development setup
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment
- [Git Setup](./GIT_SETUP.md) - Repository configuration

## 🔄 CI/CD Pipeline

Three automated workflows:

1. **build-and-deploy.yml**
   - Builds Docker images
   - Pushes to GitHub Container Registry
   - Runs tests
   - Deploys to production on push to `main`

2. **backend-tests.yml**
   - Runs Laravel tests on PostgreSQL
   - Triggered on changes to `backend/`

3. **frontend-tests.yml**
   - Builds Next.js application
   - Runs linter and tests
   - Triggered on changes to `frontend/`

### Setup Secrets for Deployment

In GitHub repository settings, add:

```
DEPLOY_HOST          → your-server.com
DEPLOY_USER          → deploy
DEPLOY_SSH_KEY       → your-private-key
DEPLOY_PORT (opt)    → 22
```

## 🐳 Docker Services

- **postgres** - PostgreSQL 16 database
- **backend** - Laravel API (port 8000)
- **queue-worker** - Job queue processor
- **frontend** - Next.js app (port 3000)

## 📖 Common Commands

### Development
```bash
# View logs
docker compose logs -f backend

# Run migrations
docker compose exec backend php artisan migrate

# Tinker shell
docker compose exec backend php artisan tinker

# Queue worker
docker compose exec backend php artisan queue:work
```

### Testing
```bash
# Backend tests
docker compose exec backend php artisan test

# Frontend linting
docker compose exec frontend npm run lint
```

### Database
```bash
# Connect to PostgreSQL
docker compose exec postgres psql -U starter_user -d starter

# Backup database
docker compose exec postgres pg_dump -U starter_user starter > backup.sql

# Restore database
docker compose exec postgres psql -U starter_user starter < backup.sql
```

## 🚢 Deployment

Push to `main` branch to trigger automatic deployment:

```bash
git push origin main
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for manual deployment steps.

## 📝 Environment Variables

See [.env.example](./.env.example) for all available variables.

Key variables:
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `APP_KEY` - Laravel encryption key

## 🆘 Troubleshooting

**Port already in use?**
```bash
# Change ports in docker-compose.yml
# Or kill existing process
lsof -i :8000
kill -9 <PID>
```

**Database connection failed?**
```bash
# Verify PostgreSQL is running
docker compose ps postgres

# Check logs
docker compose logs postgres
```

**Build issues?**
```bash
# Rebuild without cache
docker compose build --no-cache

# Restart services
docker compose restart
```

## 📄 License

MIT

## 👥 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Open Pull Request

## 📞 Support

For issues and questions, please use GitHub Issues.
