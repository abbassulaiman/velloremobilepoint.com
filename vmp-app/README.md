# Vellore Mobile Point — Full-Stack App

Business management platform for **Vellore Mobile Point** — a mobile phone repair shop in Vellore, Tamil Nadu. Built as a monorepo with a public-facing website, an admin panel, and a REST API.

**Stack:** Nuxt 3 (SSR) · Express.js · MySQL 8 · Sequelize 6 · Pinia · Tailwind CSS

---

## Project Structure

```
vmp-app/
├── frontend/                  # Nuxt 3 app — public site + admin panel
│   ├── pages/
│   │   ├── index.vue          # Public home
│   │   ├── about.vue
│   │   ├── service.vue
│   │   ├── contact.vue
│   │   └── admin/             # Admin panel (auth-gated)
│   │       ├── index.vue          Dashboard
│   │       ├── bookings.vue       Repair bookings
│   │       ├── contacts.vue       Contact form messages
│   │       ├── service-jobs.vue   In-house service tracker
│   │       ├── memberships.vue    Membership plans
│   │       ├── 3d-orders.vue      3D printing orders
│   │       ├── product-enquiries.vue
│   │       ├── inventory.vue      Inventory + QR labels
│   │       ├── inventory/scan.vue QR scanner
│   │       ├── tracker/           Financial tracker
│   │       │   ├── index.vue          Daily entry (transactions + expenses)
│   │       │   ├── reports.vue        Daily / Monthly / Yearly / Staff reports
│   │       │   └── customers.vue      Customer history
│   │       ├── staff.vue          Staff management (Owner only)
│   │       └── cms.vue            Website content editor (Owner only)
│   ├── stores/auth.ts         Pinia auth store (isOwner / isStaff getters)
│   └── middleware/auth.ts     Route guard (client-side only, ssr: false)
├── backend/
│   ├── src/
│   │   ├── app.js             Express entry point
│   │   ├── controllers/       Business logic per resource
│   │   ├── models/            Sequelize models
│   │   ├── routes/            Express routers
│   │   └── middleware/
│   │       ├── auth.js        JWT verify + 30s user cache
│   │       └── role.js        requireRole('owner') guard
│   ├── config/
│   │   ├── seed.js            DB seed (owner user + CMS defaults)
│   │   └── migrate.js
│   └── tests/
│       └── reportsController.test.js
├── database/                  SQL init files
├── docker-compose.yml         MySQL 8 + phpMyAdmin
├── .env.example               Environment variable template
└── package.json               npm workspace root
```

---

## Quick Start

### 1. Environment

```bash
cp .env.example .env
# Fill in JWT_SECRET, DB credentials, and admin credentials
```

### 2. Start MySQL (dev only)

```bash
docker compose up -d mysql phpmyadmin
```

phpMyAdmin → http://localhost:8080

### 3. Install dependencies

```bash
npm install                      # root (concurrently + playwright)
npm install --workspace=backend
npm install --workspace=frontend
```

### 4. Migrate + Seed

```bash
npm run db:migrate   # creates all tables
npm run db:seed      # seeds owner user (from .env), CMS services & settings
```

The seed script reads credentials from `.env`:

```env
ADMIN_NAME=Sarath
ADMIN_MOBILE=9999999999
ADMIN_PASSWORD=YourStrongPassword
```

Staff accounts are created through **Admin → Staff Management**.

### 5. Start dev servers

```bash
npm run dev
```

| Service     | URL                         |
|-------------|-----------------------------|
| Public site | http://localhost:9100        |
| Admin panel | http://localhost:9100/admin  |
| API         | http://localhost:9200/api    |
| phpMyAdmin  | http://localhost:8080        |

---

## Production (Docker)

Run the entire stack — MySQL, backend, and frontend — as containers:

```bash
docker compose up -d
```

On first run, set credentials in `.env` then seed the database:

```bash
docker compose exec backend node src/config/seed.js
```

Build args for the frontend image control the public API URL (baked in at build time):

```env
NUXT_PUBLIC_API_BASE=https://api.yourdomain.com/api
```

Rebuild after changing this:

```bash
docker compose build frontend
docker compose up -d frontend
```

---

## Role-Based Access Control

| Role    | Description |
|---------|-------------|
| `owner` | Full access to all features, financial data (profit, net), and admin-only categories |
| `staff` | Can create/edit own transactions and expenses; profit fields and restricted expense categories hidden both in UI and enforced server-side |

**Hidden from staff (UI + API):**
- `vmp_cost` (profit margin) on all transaction write paths
- Expense categories: `shop`, `petrol`, `staff`, `3d`
- Net profit KPIs on dashboard and reports
- Cash Flow tab and carry-forward balance
- Staff Management and CMS pages

---

## Admin Panel

| Section           | URL                           | Access  |
|-------------------|-------------------------------|---------|
| Dashboard         | /admin                        | All     |
| Daily Entry       | /admin/tracker                | All     |
| Reports           | /admin/tracker/reports        | All     |
| Customer History  | /admin/tracker/customers      | All     |
| Bookings          | /admin/bookings               | All     |
| Messages          | /admin/contacts               | All     |
| Service Jobs      | /admin/service-jobs           | All     |
| Memberships       | /admin/memberships            | All     |
| 3D Orders         | /admin/3d-orders              | All     |
| Product Enquiries | /admin/product-enquiries      | All     |
| Inventory         | /admin/inventory              | All     |
| QR Scanner        | /admin/inventory/scan         | All     |
| Staff Management  | /admin/staff                  | Owner   |
| CMS Settings      | /admin/cms                    | Owner   |

---

## API Reference

All `/api/*` routes except public ones require `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint               | Auth   | Description             |
|--------|------------------------|--------|-------------------------|
| POST   | /api/auth/login        | Public | Login, returns JWT      |
| GET    | /api/auth/me           | JWT    | Current user            |
| POST   | /api/auth/staff        | Owner  | Create staff account    |
| GET    | /api/auth/users        | Owner  | List all users          |
| PUT    | /api/auth/users/:id    | Owner  | Update user / password  |

### Bookings

| Method | Endpoint                     | Auth   |
|--------|------------------------------|--------|
| POST   | /api/bookings                | Public |
| POST   | /api/bookings/verify-otp     | Public |
| GET    | /api/bookings                | JWT    |
| GET    | /api/bookings/:id            | JWT    |
| PATCH  | /api/bookings/:id/status     | JWT    |

### Contacts

| Method | Endpoint                  | Auth   |
|--------|---------------------------|--------|
| POST   | /api/contacts             | Public |
| GET    | /api/contacts             | JWT    |
| PATCH  | /api/contacts/:id/status  | JWT    |

### Transactions

| Method | Endpoint                        | Auth  | Note                        |
|--------|---------------------------------|-------|-----------------------------|
| GET    | /api/transactions               | JWT   |                             |
| POST   | /api/transactions               | JWT   | `vmp_cost` stripped for staff |
| POST   | /api/transactions/bulk          | JWT   | `vmp_cost` stripped for staff |
| POST   | /api/transactions/import        | JWT   | XLSX import; `vmp_cost` stripped for staff |
| PUT    | /api/transactions/:id           | JWT   | `vmp_cost` stripped for staff |
| DELETE | /api/transactions/:id           | Owner |                             |

### Expenses

| Method | Endpoint                  | Auth  | Note                                         |
|--------|---------------------------|-------|----------------------------------------------|
| GET    | /api/expenses             | JWT   |                                              |
| POST   | /api/expenses             | JWT   | Categories `shop/petrol/staff/3d` → Owner only |
| POST   | /api/expenses/import      | JWT   | XLSX import; restricted categories remapped for staff |
| PUT    | /api/expenses/:id         | JWT   | Categories `shop/petrol/staff/3d` → Owner only |
| DELETE | /api/expenses/:id         | Owner |                                              |

### Reports

| Method | Endpoint                        | Auth  | Description                        |
|--------|---------------------------------|-------|------------------------------------|
| GET    | /api/reports/daily              | JWT   | ?date=YYYY-MM-DD                   |
| GET    | /api/reports/monthly            | JWT   | ?month=YYYY-MM                     |
| GET    | /api/reports/yearly             | JWT   | ?year=YYYY                         |
| GET    | /api/reports/customers          | JWT   | Customer transaction history       |
| GET    | /api/reports/staff              | JWT   | Staff expense breakdown            |
| GET    | /api/reports/cumulative-cash    | Owner | ?month=YYYY-MM — carry-forward     |
| GET    | /api/reports/all-balances       | Owner | ?recalc=1 to recalculate all months |

### Service Jobs / Memberships / 3D Orders / Product Enquiries / Inventory

All follow the same pattern — authenticated, delete requires Owner:

```
GET    /api/<resource>
POST   /api/<resource>
PUT    /api/<resource>/:id
DELETE /api/<resource>/:id    (Owner only)
```

Inventory also has:
```
GET    /api/inventory/brands
GET    /api/inventory/:id
PATCH  /api/inventory/:id/adjust   (stock adjustment)
```

### CMS

| Method | Endpoint              | Auth   |
|--------|-----------------------|--------|
| GET    | /api/cms/services     | Public |
| GET    | /api/cms/settings     | Public |
| POST   | /api/cms/services     | Owner  |
| PUT    | /api/cms/services/:id | Owner  |
| DELETE | /api/cms/services/:id | Owner  |
| PUT    | /api/cms/settings     | Owner  |

---

## Financial Reports & Carry-Forward

Monthly P&L tracks a **carry-forward** balance: the cumulative net profit from the business anchor date up to the start of each month. This is stored in the `monthly_balances` table and displayed as "Opening Balance" in the Monthly report (Owner only).

The anchor date defaults to `2025-09-01` and is configurable:

```env
REPORT_ANCHOR_DATE=2025-09-01
```

---

## Inventory & QR Codes

- Each inventory item has a unique QR code linking to `/admin/inventory/scan?id=<id>`
- The scan page opens the device camera, decodes the QR, and allows stock adjustment
- Bulk QR labels can be printed directly from the inventory list

---

## Excel Import Format

**Transactions** (`POST /api/transactions/import`):

| Date | S. No | Name | Mobile Number | Products | Amount | Cash | Gpay | VMP | Sales | Service |

**Expenses** (`POST /api/expenses/import`):

| Date | Exp for | Expense | AMOUNT |

---

## Tests

```bash
npm run test --workspace=backend
```

Covers: `computeCarryForward`, `saveMonthlyBalance`, `staffBreakdown` date filter, `monthlySummary` carry-forward scope, and chain integrity.

---

## WhatsApp Business API

1. Create a Meta Developer App at https://developers.facebook.com
2. Add WhatsApp Business product
3. Set in `.env`:

```env
WA_PHONE_NUMBER_ID=your_phone_number_id
WA_ACCESS_TOKEN=your_access_token
WA_VERIFY_TOKEN=your_webhook_verify_token
OWNER_WHATSAPP=91XXXXXXXXXX
```

Status update messages are sent automatically when a booking status changes.
