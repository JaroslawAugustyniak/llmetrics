#!/bin/bash

# Git Repository Initialization Script
# Skrypt do automatycznego inicjalizowania git repozytorium

set -e  # Exit on error

echo "🚀 Git Repository Initialization"
echo "================================"
echo ""

# Check if Git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git nie jest zainstalowany. Zainstaluj Git i spróbuj ponownie."
    exit 1
fi

echo "✅ Git znaleziony: $(git --version)"
echo ""

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Błąd: Uruchom skrypt z katalogu głównego projektu (gdzie jest docker-compose.yml)"
    exit 1
fi

# Initialize git
echo "📦 Inicjalizuję repozytorium Git..."
if [ -d ".git" ]; then
    echo "⚠️  Repozytorium Git już istnieje. Pomijam inicjalizację."
else
    git init
    echo "✅ Repozytorium zainicjalizowane"
fi

echo ""
echo "📝 Dodaję pliki do staged area..."
git add .
echo "✅ Pliki dodane (respektując .gitignore)"

echo ""
echo "📊 Status repozytorium:"
git status

echo ""
echo "⚠️  PRZED COMMITKIEM - Sprawdź czy:"
echo "  ☐ Brak .env plików w repozytorium"
echo "  ☐ Brak node_modules/ w repozytorium"
echo "  ☐ Brak vendor/ w repozytorium"
echo "  ☐ Są .env.example pliki"
echo ""

read -p "👉 Czy chcesz stwórzyć first commit? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git commit -m "Initial commit: Complete Starter project setup

- Authentication system with Laravel API and Sanctum
- Token-based authentication with localStorage
- User profile management
- Password reset functionality with email
- Email verification system
- Frontend with Next.js 16 and next-intl
- Backend with Laravel 10
- Cleaned up and removed next-auth dependency
- Removed unused code and dependencies"

    echo "✅ First commit stworzony!"
    echo ""
    echo "📌 Następne kroki:"
    echo "  1. Przejdź do GitHub/GitLab i stwórz nowe repozytorium"
    echo "  2. Uruchom komendy:"
    echo "     git remote add origin <URL_TWOJEGO_REPO>"
    echo "     git branch -M main"
    echo "     git push -u origin main"
else
    echo "⏭️  Commit nie stworzony. Możesz to zrobić ręcznie:"
    echo "     git commit -m 'Initial commit: ...'"
fi

echo ""
echo "🎉 Gotowe! Twoje repozytorium Git jest przygotowane."
echo ""
echo "📖 Więcej informacji: cat GIT_SETUP.md"