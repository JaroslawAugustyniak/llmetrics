#!/bin/bash

# Skrypt do konfiguracji serwera produkcyjnego
# Użycie: bash scripts/deploy-setup.sh

set -e

echo "🚀 Konfiguracja llmetrics na produkcję"
echo "========================================"

# Kolory dla output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Sprawdzenie czy jesteśmy na serwerze
if [ ! -f docker-compose.prod.yml ]; then
    echo -e "${RED}❌ Błąd: docker-compose.prod.yml nie znaleziony${NC}"
    echo "Uruchom ten skrypt z głównego katalogu projektu"
    exit 1
fi

echo -e "${YELLOW}📋 Kroki konfiguracji:${NC}"
echo "1. Sprawdzanie Docker"
echo "2. Tworzenie katalogów"
echo "3. Konfiguracja zmiennych .env"
echo "4. Uruchomienie bazy danych"
echo "5. Uruchomienie aplikacji"

# 1. Sprawdzenie Docker
echo -e "\n${YELLOW}1️⃣  Sprawdzanie Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker nie jest zainstalowany${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker jest zainstalowany${NC}"

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose nie jest zainstalowany${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose jest zainstalowany${NC}"

# 2. Tworzenie katalogów
echo -e "\n${YELLOW}2️⃣  Tworzenie katalogów...${NC}"
mkdir -p docker
mkdir -p backups
echo -e "${GREEN}✓ Katalogi utworzone${NC}"

# 3. Konfiguracja .env
echo -e "\n${YELLOW}3️⃣  Konfiguracja zmiennych środowiska...${NC}"
if [ ! -f .env ]; then
    echo -e "${YELLOW}Tworzę .env z szablonu...${NC}"
    cp .env.prod.example .env
    echo -e "${YELLOW}⚠️  Edytuj .env i uzupełnij zmienne:${NC}"
    echo "   - DB_PASSWORD"
    echo "   - APP_KEY"
    echo "   - NEXT_PUBLIC_API_URL"
    echo ""
    echo "Otwórz plik .env:"
    echo "  nano .env"
    exit 0
else
    echo -e "${GREEN}✓ Plik .env już istnieje${NC}"
fi

# Sprawdzenie wymaganych zmiennych
if ! grep -q "APP_KEY=" .env || ! grep -q "DB_PASSWORD=" .env; then
    echo -e "${RED}❌ Brak wymaganych zmiennych w .env${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Zmienne środowiska skonfigurowane${NC}"

# 4. Uruchomienie bazy danych
echo -e "\n${YELLOW}4️⃣  Uruchomienie bazy danych...${NC}"
docker compose -f docker-compose.prod.yml up -d mysql
echo -e "${YELLOW}⏳ Czekam na MySQL...${NC}"
sleep 10
docker compose -f docker-compose.prod.yml logs mysql | head -20

# 5. Uruchomienie aplikacji
echo -e "\n${YELLOW}5️⃣  Uruchomienie aplikacji...${NC}"
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d

echo -e "\n${GREEN}✅ Konfiguracja zakończona!${NC}"
echo ""
echo "Następne kroki:"
echo "1. Sprawdź status: docker compose -f docker-compose.prod.yml ps"
echo "2. Sprawdź logi: docker compose -f docker-compose.prod.yml logs -f"
echo "3. Uruchom migracje: docker compose -f docker-compose.prod.yml exec backend php artisan migrate --force"
