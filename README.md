# Freelancer Invoice Tracker

A full-stack invoice tracker with JWT authentication, PostgreSQL, PDF invoices, email delivery, Stripe Checkout, and Docker deployment.

## Architecture

- **Frontend:** Next.js, React , CSS 
- **API:** Express on Node.js
- **Database:** PostgreSQL
- **Authentication:** JWT tokens and bcrypt password hashing
- **Deployment:** Docker Compose

The browser talks to the Express API. The API owns database access and checks `user_id` from the verified JWT, so a client cannot select another user's invoices by changing a request body.

## 1. Prerequisites

Install:

- Node.js 20 or newer
- PostgreSQL 16 or Docker Desktop
- Stripe account in test mode
- Stripe CLI for local webhook testing

Check the tools:

```powershell
node --version
npm --version
docker --version
docker compose version
stripe --version
```

A version command prints the installed tool version. It is a quick check that the command is available on your `PATH`, which is the list of folders your shell searches for programs.

## 2. Configure secrets

For Docker Compose:

```powershell
Copy-Item .env.example .env
```

Open `.env` and replace `DB_PASSWORD` and `JWT_SECRET`. Add Stripe and email values when those features are needed. Never commit `.env`; it is ignored by Git because it contains secrets.

Important variables:

| Variable | Meaning |
| --- | --- |
| `DB_*` | PostgreSQL connection and database settings |
| `JWT_SECRET` | Private key used to sign login tokens |
| `CLIENT_URL` | Backend-approved browser origin for CORS and Stripe redirects |
| `NEXT_PUBLIC_API_URL` | API URL embedded into the browser build |
| `STRIPE_SECRET_KEY` | Server-only Stripe API key; use a test key locally |
| `STRIPE_WEBHOOK_SECRET` | Signing secret printed by `stripe listen` |
| `EMAIL_*` | Gmail SMTP credentials; use a Gmail app password, not your normal password |

For local Node development without Docker, keep the existing `server/.env` and make sure it contains the same database, JWT, Stripe, and email values.

## 3. Database migrations

A migration is a versioned SQL change to the database schema. This project uses `server/migrations/001_initial.sql` to create the `users`, `invoices`, indexes, and constraints.

Run it locally:

```powershell
Set-Location server
npm install
npm run migrate
npm run migrate
```

The first command installs backend packages. `npm run migrate` starts `scripts/migrate.js`, which opens a database connection, runs pending `.sql` files in sorted order inside a transaction, and records each filename in `schema_migrations`. Running it twice is an idempotency check: the second run should say `Skipped 001_initial.sql`.

A transaction means all SQL changes commit together, or all are rolled back if one fails. This prevents a partially-created schema.

With Docker:

```powershell
Copy-Item .env.example .env
# Edit .env first, then:
docker compose up -d db
docker compose run --rm server npm run migrate
docker compose up --build -d
```

`up -d db` starts PostgreSQL in the background. `run --rm server` creates a temporary API container only to run migrations, then removes it. `up --build -d` rebuilds images after code changes and starts all services in the background.

Verify migration state:

```powershell
docker compose exec db psql -U postgres -d micro_saas -c "SELECT filename, applied_at FROM schema_migrations ORDER BY filename;"
```

`exec` runs a command inside an existing container. `psql` is PostgreSQL's command-line client. The query should show `001_initial.sql`.

## 4. Run the application locally

Without Docker, use two terminals:

```powershell
Set-Location server
npm run dev
```

```powershell
Set-Location freelancer-invoice-tracker
npm install
npm run dev
```

`npm run dev` starts a development server with automatic reload. Open `http://localhost:3000`; the API listens on `http://localhost:5000`.

With Docker:

```powershell
docker compose up --build
```

Open `http://localhost:3000`. Stop the services with `Ctrl+C`, or use `docker compose down`. Add `-v` only when you intentionally want to delete the PostgreSQL volume and all local database data.

`NEXT_PUBLIC_API_URL` is passed as a Docker build argument because Next.js embeds public environment variables into the browser bundle while building. If you change this URL, rebuild the frontend with `docker compose build frontend` before starting it again.

## 5. Test Stripe webhooks locally

Stripe webhooks are signed HTTP requests from Stripe to the API. They are the reliable server-to-server payment notification; the browser redirect alone is not proof of payment.

1. Put a Stripe test secret key in `.env` as `STRIPE_SECRET_KEY`.
2. Start the API and frontend.
3. In a second terminal, authenticate the Stripe CLI:

```powershell
stripe login
```

4. Forward Stripe events to the local API:

```powershell
stripe listen --forward-to localhost:5000/stripe/webhook
```

The CLI prints a value beginning with `whsec_`. Copy it into `.env` as `STRIPE_WEBHOOK_SECRET`, then restart the API. Do not use the `whsec_` value as `STRIPE_SECRET_KEY`; they serve different purposes.

5. Log in, create an invoice, and choose **Pay Now**.
6. On the Stripe test Checkout page, use card `4242 4242 4242 4242`, any future expiry date, any three-digit CVC, and any test name.
7. Confirm the CLI prints a successful `checkout.session.completed` delivery.
8. Refresh the dashboard and confirm the invoice status is `Paid`.

Useful webhook checks:

```powershell
stripe events resend <event_id> --webhook-endpoint=<endpoint_id>
```

The resend command replays an event to test retry behavior. The webhook route rejects invalid signatures with HTTP 400, and repeated paid events do not needlessly change an already-paid invoice.

## 6. Verify before deployment

```powershell
Set-Location server
node --check index.js
node --check scripts/migrate.js
npm run migrate

Set-Location ..\freelancer-invoice-tracker
npm run lint
npm run build

Set-Location ..
docker compose config
```

`node --check` parses JavaScript without starting the server. `npm run lint` finds common code-quality errors. `npm run build` creates the optimized Next.js production build. `docker compose config` expands and validates Compose configuration without starting containers.

## 7. Production checklist

- Use a unique randomly generated `JWT_SECRET`.
- Use a strong database password stored in the hosting provider's secret manager.
- Use Stripe live keys only in production secrets, never in source control.
- Configure the production webhook endpoint as `https://your-domain.example/stripe/webhook`.
- Set `CLIENT_URL` and `NEXT_PUBLIC_API_URL` to HTTPS production URLs.
- Set `NEXT_PUBLIC_API_URL` before building the frontend image; changing it after the image is built does not change the browser bundle.
- Use a real SMTP provider or verified email service for invoice delivery.
- Run migrations before starting the new API version.
- Back up PostgreSQL and test restoring a backup.
- Put HTTPS and rate limiting in front of the API before public launch.
- Do not run `docker compose down -v` on production; it deletes the database volume.

## Useful commands

```powershell
docker compose ps
docker compose logs -f server
docker compose logs -f db
docker compose down
```

`ps` shows container status. `logs -f` follows live logs, which is useful for webhook and database errors. `down` stops and removes containers but keeps the named PostgreSQL volume unless `-v` is supplied.
