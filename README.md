# Odoo Cafe POS

> A full-stack restaurant POS platform for managing orders, tables, payments, kitchen operations, self-ordering, and real-time customer experiences.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-blue?logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-realtime-black?logo=socket.io)](https://socket.io/)

Odoo Cafe POS is a full-stack Point of Sale system built for restaurants and cafés. It brings the front-of-house POS, kitchen display, customer-facing display, QR-based self-ordering, payments, reservations, promotions, and administration into one connected platform.

The system is designed around a real restaurant workflow:

**Configure → Order → Prepare → Pay → Complete → Analyze**

---

## Features

### POS Management

- Table and floor selection
- Product search and category filtering
- Cart and quantity management
- Customer assignment
- Draft, cooking, completed, and paid order lifecycle
- Coupon and promotion handling
- Kitchen order submission
- Multiple payment methods
- Receipt printing and email delivery

### Kitchen Display System

The Kitchen Display System (KDS) receives POS orders in real time through Socket.IO.

Orders move through:

```text
To Cook → Preparing → Completed
````

Kitchen staff can:

* Search orders
* Filter by product or category
* Update order stages
* Track ordered quantities
* Mark individual items as completed

### Customer Self-Ordering

Customers can scan a table-specific QR code to access the digital menu.

Supported modes:

* Online Ordering
* QR Menu

The self-ordering flow supports:

* Product browsing
* Cart management
* Coupon codes
* Order placement
* Live order-status tracking

### Customer-Facing Display

A dedicated display keeps customers informed during checkout with:

* Ordered products
* Quantities and prices
* Subtotal
* Tax
* Discounts
* Total amount
* Payment information
* UPI QR code
* Order completion confirmation

### Payments

Supported payment methods:

* Cash
* UPI
* Card / Digital Payment

UPI payments use the configured UPI ID to generate a payment QR code.

### Inventory & Product Management

* Product CRUD
* Category management
* Pricing
* Tax configuration
* Units of measure
* Product descriptions
* Category colors

### Employees & Access Control

The system supports role-based access for:

* Admin
* Employee / Cashier

Authentication uses JWT with password hashing, validation, CORS protection, and centralized error handling.

### Reservations & Promotions

* Table reservations and bookings
* Percentage discounts
* Fixed-amount discounts
* Coupon codes
* Quantity-based promotions
* Order-value promotions

### AR Product Visualization

Products can support AR visualization using GLB models, allowing compatible products to be experienced beyond the standard POS catalog.

### Reporting

The reporting system provides sales insights including:

* Total orders
* Revenue
* Average order value
* Sales trends
* Top products
* Top categories
* Highest-value orders

Reports can be exported for further use.

## Tech Stack

### Backend

| Technology | Purpose                 |
| ---------- | ----------------------- |
| Node.js    | Runtime                 |
| Express.js | REST API                |
| Socket.IO  | Real-time communication |
| Prisma     | ORM                     |
| PostgreSQL | Database                |
| JWT        | Authentication          |
| Zod        | Input validation        |
| bcryptjs   | Password hashing        |

### Frontend

| Technology       | Purpose           |
| ---------------- | ----------------- |
| Next.js 16       | Web application   |
| React 18         | UI                |
| TypeScript       | Type safety       |
| Tailwind CSS v4  | Styling           |
| Socket.IO Client | Real-time updates |
| Lucide React     | Icons             |

---

## Project Structure

```text
Odoo-Cafe-POS/
│
├── backend/
│   ├── src/
│   │   ├── index.js
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── lib/
│   │   └── validations/
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.js
│   │
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── context/
│   │   ├── services/
│   │   ├── lib/
│   │   └── utils/
│   │
│   ├── public/
│   └── package.json
│
├── package.json
└── README.md
```

---

## Prerequisites

Before getting started, make sure you have:

* Node.js `18+`
* npm `9+`
* PostgreSQL `12+`
* Git

Check your installed versions:

```bash
node --version
npm --version
psql --version
git --version
```

---

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Odoo-Cafe-POS
```

### 2. Install Dependencies

The repository is organized as a monorepo with separate frontend and backend applications.

```bash
npm run install:all
```

### 3. Configure Environment Variables

Create the backend environment file:

**`backend/.env`**

```env
DATABASE_URL="postgresql://user:password@localhost:5432/odoo_cafe"
PORT=5000
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-secret-key-here
```

Create the frontend environment file:

**`frontend/.env.local`**

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

> Do not commit real credentials or secrets to the repository.

### 4. Setup Prisma

Generate the Prisma client:

```bash
npm run db:generate
```

Run database migrations:

```bash
npm run db:migrate
```

Optionally seed the database:

```bash
npm run db:seed
```

### 5. Start the Development Environment

Run frontend and backend together:

```bash
npm run dev
```

Or run them independently:

```bash
npm run dev:frontend
npm run dev:backend
```

Default development URLs:

```text
Frontend → http://localhost:3000
Backend  → http://localhost:5000
```

---

## Available Commands

### Root

```bash
npm run install:all
npm run dev
npm run dev:frontend
npm run dev:backend
npm run db:generate
npm run db:migrate
npm run db:seed
```

### Backend

```bash
cd backend

npm run dev
npm run start
```

### Frontend

```bash
cd frontend

npm run dev
npm run dev:local
npm run build
npm run start
npm run lint
npm run ngrok
```

---

## API Overview

### Authentication

```text
POST /api/auth/login
POST /api/auth/signup
POST /api/auth/logout
```

### POS

```text
GET/POST /api/orders
GET/POST /api/products
GET/POST /api/categories
GET/POST /api/tables
GET/POST /api/floors
GET/POST /api/session
GET/POST /api/payments
GET/POST /api/kds
```

### Customers

```text
GET /api/s/[token]
GET /api/customer-display
GET/POST /api/customers
GET/POST /api/bookings
```

### Revenue

```text
GET/POST /api/coupons
GET/POST /api/promotions
GET /api/reports
```

### Administration

```text
GET/POST /api/users
GET/POST /api/payment-methods
GET/POST /api/settings
```

---

## Database

The application uses PostgreSQL with Prisma ORM.

Core models include:

```text
User
Order
OrderItem
Product
Category
Table
Floor
Payment
PaymentMethod
Customer
PosSession
Coupon
Promotion
Booking
Settings
```

The complete database schema is available at:

```text
backend/prisma/schema.prisma
```

---

## Real-Time Communication

Socket.IO is used for live application events.

Real-time functionality includes:

* Kitchen order updates
* Customer display synchronization
* Self-ordering updates
* Staff notifications
* Order status changes

This keeps the different interfaces synchronized without requiring manual page refreshes.

---

## Security

The backend includes:

* JWT-based authentication
* Role-Based Access Control (RBAC)
* Password hashing with bcryptjs
* CORS configuration
* Zod request validation
* Centralized error handling

---

## Testing

The current project includes backend and end-to-end test scripts.

Run the backend test:

```bash
node backend/test.js
```

Run the end-to-end test:

```bash
node e2e_test.js
```

These tests cover API behavior and key application workflows.

---

## Deployment

### Backend

Configure production environment variables:

```env
DATABASE_URL=<production-db-url>
FRONTEND_URL=<production-frontend-url>
JWT_SECRET=<secure-random-key>
```

Install production dependencies:

```bash
cd backend
npm install --production
```

Run migrations:

```bash
npm run db:migrate
```

Start the server:

```bash
npm run start
```

### Frontend

Build the production application:

```bash
cd frontend
npm run build
```

Configure:

```env
NEXT_PUBLIC_API_URL=<production-api-url>
NEXT_PUBLIC_SOCKET_URL=<production-api-url>
```

Start the application:

```bash
npm run start
```

---

## Development Tips

### Prisma Studio

Use Prisma Studio to inspect database records:

```bash
npx prisma studio
```

### API Debugging

Use the included end-to-end test script or an API client such as Postman to test backend endpoints.

### Socket.IO Debugging

Check the browser and backend console for connection and event logs when troubleshooting real-time functionality.

---

## Troubleshooting

### Database Connection Fails

Check that:

1. PostgreSQL is running.
2. `DATABASE_URL` is correct.
3. The target database exists.
4. Prisma migrations have been applied.

```bash
npm run db:migrate
```

### Frontend Cannot Connect to Backend

Verify:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Also make sure the backend is running and the configured CORS origin matches the frontend URL.

### Socket.IO Is Not Connecting

Check:

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

Then inspect the browser console and backend logs for connection errors.

---

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Run the relevant tests and lint checks.
5. Commit your changes.
6. Push your branch.
7. Open a Pull Request.

```bash
git checkout -b feature/your-feature
git add .
git commit -m "Add your feature"
git push origin feature/your-feature
```

Please keep pull requests focused and provide enough context for the changes being introduced.

---

## Versioning

This project follows [Semantic Versioning](https://semver.org/).

**Current version:** `2.0.0`

---

## License

This project is part of the Odoo Cafe POS system.

---

## Acknowledgments

* Odoo Cafe POS challenge
* Open-source technologies used throughout the project
* Contributors and collaborators

---

## Project Status

**Active Development**

The current release includes the core POS, restaurant management, real-time communication, self-ordering, payment, customer, booking, promotion, and reporting functionality.

---

<div align="center">

### Odoo Cafe POS

**One system. Every café workflow.**

</div>
