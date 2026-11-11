# MATRIXPC API

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `DATABASE_URL` and `JWT_SECRET`.
3. Apply the database migrations with `npm run db:migrate`.
4. Start the API with `npm run dev` (it generates the Prisma client first).

The API listens on port `5000` by default. The frontend Vite server proxies `/api` to this port; set `VITE_PROXY_TARGET` if the API runs elsewhere.

## Routes

- `GET /api/health` — service health check.
- `GET /api/products` — active catalog products.
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` — authentication.
- `POST /api/contact` — validates and stores a contact inquiry. A valid request includes `name`, `email`, `topic`, `message`, and `consent: true`.

