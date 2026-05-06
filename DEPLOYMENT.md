# Instrukcja wdrażania llmetrics na produkcję

## 📋 Wymagania wstępne

- **GitHub Account** - z dostępem do repozytorium
- **Serwer produkcyjny** - z zainstalowanymi:
  - Docker
  - Docker Compose
  - SSH dostęp
- **Domena** - skonfigurowana DNS

## 🔧 Krok 1: Przygotowanie serwera produkcyjnego

### 1.1 Zaloguj się na serwer
```bash
ssh user@your-server.com
```

### 1.2 Przygotuj katalog dla projektu
```bash
mkdir -p /opt/llmetrics
cd /opt/llmetrics
```

### 1.3 Skopiuj potrzebne pliki z repozytorium
```bash
# Klonuj repozytorium lub pobierz pliki:
git clone https://github.com/jaroslawaugustyniak/llmetrics.git temp
cd temp

# Skopiuj niezbędne pliki do /opt/llmetrics
cp docker-compose.prod.yml /opt/llmetrics/
cp .env.prod.example /opt/llmetrics/.env
cp docker/nginx-prod.conf /opt/llmetrics/docker/
cp docker/supervisord.conf /opt/llmetrics/docker/
cp docker/supervisord-worker.conf /opt/llmetrics/docker/
cp entrypoint.sh /opt/llmetrics/

cd /opt/llmetrics
rm -rf temp
```

### 1.4 Skonfiguruj zmienne środowiska
```bash
# Edytuj .env i uzupełnij potrzebne wartości
nano .env
```

**Przykład zawartości .env:**
```
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:your-app-key-here-generate-one

# Database
DB_NAME=llmetrics_prod
DB_USER=llmetrics_user
DB_PASSWORD=very-secure-password-here
DB_HOST=mysql
DB_PORT=3306

# Frontend
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### 1.5 Utwórz strukturę katalogów
```bash
mkdir -p docker
chmod 755 docker
```

## 🔐 Krok 2: Konfiguracja GitHub Secrets

Aby workflow mógł wdrażać kod, musisz skonfigurować sekrety w repozytorium GitHub.

### 2.1 Wejdź do ustawień repozytorium
1. GitHub → Twoje repozytorium → Settings
2. Secrets and variables → Actions

### 2.2 Dodaj sekrety (New repository secret)

| Nazwa | Wartość |
|-------|---------|
| `DEPLOY_HOST` | IP lub domena serwera (np. `206.189.100.123`) |
| `DEPLOY_USER` | Użytkownik SSH (np. `ubuntu`, `root`) |
| `DEPLOY_SSH_KEY` | Prywatny klucz SSH (zawartość `~/.ssh/id_rsa`) |
| `DEPLOY_PORT` | Port SSH (domyślnie `22`) |
| `DEPLOY_PATH` | Ścieżka na serwerze (np. `/opt/llmetrics`) |

### 2.3 Generowanie klucza SSH (jeśli go nie masz)

Na serwerze:
```bash
ssh-keygen -t rsa -b 4096 -f /home/user/.ssh/deploy_key -N ""
cat /home/user/.ssh/deploy_key.pub >> /home/user/.ssh/authorized_keys
chmod 600 /home/user/.ssh/authorized_keys
```

Na lokalnym komputerze, dodaj zawartość `/home/user/.ssh/deploy_key` jako `DEPLOY_SSH_KEY`.

## 🚀 Krok 3: Wdrażanie

### 3.1 Aktywacja workflow przy pushu na main

Po skonfiguracji sekretów, wystarczy pushować zmiany na branch `main`:

```bash
git add .
git commit -m "Deploy configuration"
git push origin main
```

### 3.2 GitHub Actions automatycznie:
1. **Build** - Buduje obraz Docker (Dockerfile.prod)
2. **Test** - Uruchamia testy (backend-tests.yml, frontend-tests.yml)
3. **Push** - Pushuje obraz do GitHub Container Registry (ghcr.io)
4. **Deploy** - Łączy się przez SSH z serwerem i:
   - Loguje się do Docker Registry
   - Pobiera nowy obraz
   - Startuje kontenery
   - Uruchamia migracje bazy danych
   - Cachuje konfigurację

### 3.3 Monitorowanie deploymentu

Przejdź do: GitHub → Repozytorium → Actions

Możesz śledzić postęp deploymentu w real-time.

## 📊 Krok 4: Weryfikacja na serwerze

### 4.1 Sprawdź status kontenerów
```bash
cd /opt/llmetrics
docker compose -f docker-compose.prod.yml ps
```

### 4.2 Sprawdź logi
```bash
# Backend
docker compose -f docker-compose.prod.yml logs -f backend

# Baza danych
docker compose -f docker-compose.prod.yml logs -f mysql

# Nginx
docker compose -f docker-compose.prod.yml logs -f nginx
```

### 4.3 Sprawdzenie zdrowia aplikacji
```bash
curl http://localhost:8000/health
```

## 🛡️ Krok 5: SSL/TLS (HTTPS)

Aby włączyć HTTPS, skonfiguruj Let's Encrypt:

```bash
cd /opt/llmetrics

# Zainstaluj certbot
sudo apt-get install certbot python3-certbot-nginx

# Wygeneruj certyfikat
sudo certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com

# Zaktualizuj docker-compose.prod.yml aby montować certyfikaty
```

## 📝 Krok 6: Backup bazy danych

Dodaj cronjob do backupowania bazy danych:

```bash
# Edytuj crontab
crontab -e

# Dodaj (backup codziennie o 2:00 AM):
0 2 * * * cd /opt/llmetrics && docker compose -f docker-compose.prod.yml exec -T mysql mysqldump -u root -p$DB_PASSWORD $DB_NAME > /backup/llmetrics_$(date +\%Y\%m\%d_\%H\%M\%S).sql
```

## 🔄 Aktualizacje i ponowne wdrażanie

Aby wdrażać aktualizacje, wystarczy:

```bash
git add .
git commit -m "Your change description"
git push origin main
```

GitHub Actions automatycznie:
- Zbuduje nowy obraz
- Przejdzie testy
- Wdroży na produkcję

## ❌ Troubleshooting

### Deployment się nie uruchamia
- Sprawdź czy zalogowałeś się do repozytorium
- Sprawdź czy sekrety GitHub są prawidłowo ustawione
- Przejdź do Actions i sprawdź logi błędów

### Błędy podczas migracji
```bash
# Ręczne uruchomienie migracji
docker compose -f docker-compose.prod.yml exec backend php artisan migrate --force
```

### Baza danych nie startuje
```bash
# Sprawdź logi
docker compose -f docker-compose.prod.yml logs mysql

# Usuń dane i zacznij od nowa (uwaga - usuwa dane!)
docker volume rm llmetrics_mysql_data
```

### Brak dostępu do aplikacji
```bash
# Sprawdź czy Nginx słucha
curl http://localhost:8000

# Sprawdź firewall
sudo ufw status
sudo ufw allow 80
sudo ufw allow 443
```

## 📞 Wsparcie

Jeśli napotkasz problemy, sprawdź:
1. Logi na GitHub Actions
2. Logi na serwerze: `docker compose -f docker-compose.prod.yml logs`
3. Git status: `git status`

---

**Gotowe do produkcji! 🎉**
