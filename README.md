# 🍔 Restaurant Kiosk McDonald's - Instrukcja uruchomienia

## 📋 Wymagania

Przed rozpoczęciem upewnij się, że masz zainstalowane:

- **Node.js** (wersja 16 lub nowsza) - [Pobierz tutaj](https://nodejs.org/)
- **PostgreSQL** - [Pobierz tutaj](https://www.postgresql.org/download/)
- **MongoDB** - [Pobierz tutaj](https://www.mongodb.com/try/download/community)
- **Git** - [Pobierz tutaj](https://git-scm.com/)

## 🗄️ Konfiguracja baz danych

### PostgreSQL

1. Uruchom PostgreSQL
2. Utwórz 4 bazy danych:

```sql
CREATE DATABASE restaurant_menu;
CREATE DATABASE restaurant_orders;
CREATE DATABASE restaurant_delivery;
CREATE DATABASE restaurant_payments;
```

### MongoDB

1. Uruchom MongoDB (domyślnie na porcie 27017)
2. Bazy MongoDB będą utworzone automatycznie

## 🚀 Instalacja i uruchomienie

### Krok 1: Pobierz projekt

```bash
git clone [ADRES_TWOJEGO_REPO]
cd restaurant-kiosk
```

### Krok 2: Uruchom backendy

**Otwórz 4 oddzielne terminale** i wykonaj następujące polecenia:

#### Terminal 1 - Menu Service (Port 3001)

```bash
cd backend/menu-service
npm install
npm start
```

#### Terminal 2 - Order Service (Port 3002)

```bash
cd backend/order-service
npm install
npm start
```

#### Terminal 3 - Delivery Service (Port 3003)

```bash
cd backend/delivery-service
npm install
npm start
```

#### Terminal 4 - Payment Service (Port 3004)

```bash
cd backend/payment-service
npm install
npm start
```

### Krok 3: Uruchom frontend

**Otwórz 5. terminal:**

```bash
cd frontend
npm install
npm start
```

## ✅ Sprawdzenie instalacji

### Backendy

Sprawdź czy wszystkie serwisy działają:

- Menu Service: http://localhost:3001/health
- Order Service: http://localhost:3002/health
- Delivery Service: http://localhost:3003/health
- Payment Service: http://localhost:3004/health

### Frontend

- Aplikacja: http://localhost:3000

## 📂 Struktura projektu

```
restaurant-kiosk/
├── backend/
│   ├── menu-service/       # Zarządzanie menu i produktami
│   ├── order-service/      # Zarządzanie zamówieniami
│   ├── delivery-service/   # Opcje dostawy i stoliki
│   └── payment-service/    # Płatności i kody promocyjne
└── frontend/               # Aplikacja React
```

## 🎯 Główne funkcjonalności

### ✨ Co działa w aplikacji:

1. **Przeglądanie menu**

   - Kategorie produktów (Burgery, Frytki, Napoje, Desery)
   - Szczegóły produktów z cenami

2. **Koszyk**

   - Dodawanie/usuwanie produktów
   - Personalizacja zamówień (rozmiary, dodatki, poziom ostrości)
   - Instrukcje specjalne

3. **Finalizacja zamówienia**

   - Wybór opcji dostawy (Na miejscu/Na wynos/Dostawa)
   - Wybór stolika (dla opcji "Na miejscu")
   - Metody płatności

4. **Płatność**
   - Symulacja płatności
   - Generowanie paragonu

## 🛠️ Rozwiązywanie problemów

### Problem: Serwis nie startuje

```bash
# Sprawdź czy port nie jest zajęty
netstat -tulpn | grep :3001

# Jeśli zajęty, zabij proces
kill -9 [PID]
```

### Problem: Błąd bazy danych

1. Upewnij się, że PostgreSQL i MongoDB są uruchomione
2. Sprawdź pliki `.env` w każdym serwisie
3. Sprawdź czy nazwy baz danych są poprawne

### Problem: Frontend nie łączy się z backendem

1. Sprawdź czy wszystkie 4 serwisy backend działają
2. Sprawdź porty w plikach `frontend/src/api/*.js`
3. Wyczyść cache przeglądarki

## 📱 Jak używać aplikacji

1. **Start**: Otwórz http://localhost:3000
2. **Menu**: Wybierz kategorię (np. "Burgery")
3. **Produkt**: Kliknij na produkt, dostosuj go i dodaj do koszyka
4. **Koszyk**: Przejdź do koszyka (przycisk w górnym menu)
5. **Finalizacja**: Kliknij "Przejdź do finalizacji"
6. **Opcje**: Wybierz dostawę i płatność
7. **Zamówienie**: Złóż zamówienie

## 📊 Bazy danych

### PostgreSQL (dane strukturalne)

- `restaurant_menu` - kategorie i produkty
- `restaurant_orders` - zamówienia i pozycje
- `restaurant_delivery` - opcje dostawy i stoliki
- `restaurant_payments` - płatności i kody promocyjne

### MongoDB (dane niestrukturalne)

- Szczegóły produktów (składniki, wartości odżywcze)
- Personalizacje zamówień
- Paragony

**Powodzenia! 🎉**

Jeśli wszystko działa, powinieneś zobaczyć działającą aplikację kioska restauracyjnego z pełną funkcjonalnością zamawiania.
