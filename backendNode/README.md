# backendNode

Express + TypeScript backend for PoolTrip, migrated from the Java backend with compatible `/api` routes.

## Quick Start

1. Copy `.env.example` to `.env` and fill secrets.
2. Install deps:
   - `npm install`
3. Generate Prisma client:
   - `npm run prisma:generate`
4. Start dev server:
   - `npm run dev`

## Notes

- Default server port is `8091`.
- Clients should use base URL `http://localhost:8091/api`.
- Route groups:
  - `/api/auth/*`
  - `/api/packages/*`
  - `/api/bookings/*`
  - `/api/subscribe`
