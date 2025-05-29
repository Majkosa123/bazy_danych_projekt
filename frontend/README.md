# Restaurant Kiosk System

## Uruchomienie projektu

### Backend

Każdy serwis uruchamiaj w osobnym terminalu:

```bash
# Menu Service (port 3001)
cd backend/menu-service
npm install
npm start

# Order Service (port 3002)
cd backend/order-service
npm install
npm start

# Delivery Service (port 3003)
cd backend/delivery-service
npm install
npm start

# Payment Service (port 3004)
cd backend/payment-service
npm install
npm start
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## Wymagane bazy danych

Upewnij się że masz uruchomione:

- PostgreSQL (dla każdego serwisu osobna baza)
- MongoDB (dla szczegółów produktów i customizacji)

## Struktura projektu

- **Backend**: 4 mikroserwisy (menu, order, delivery, payment)
- **Frontend**: React SPA z React Router
- **Bazy danych**: PostgreSQL + MongoDB

## Główne funkcjonalności

1. Przeglądanie menu i kategorii
2. Dodawanie produktów do koszyka
3. Customizacja produktów
4. Wybór opcji dostawy
5. Płatność
6. Generowanie paragonu

## Rozwiązanie błędów

Jeśli frontend nie startuje:

1. Sprawdź czy wszystkie komponenty są poprawnie zaimportowane
2. Upewnij się że nie ma błędów w console
3. Sprawdź czy backend serwisy działają na odpowiednich portach
