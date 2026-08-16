# OFFLINE CLUB — Odoo Cafe POS

> A complete, modern café Point-of-Sale system built for fast ordering, real-time kitchen operations, seamless payments, and intelligent restaurant management.

**OFFLINE CLUB** is a full-stack web-based Restaurant Point-of-Sale platform designed around the operational workflow of a modern café.

The system connects the **admin backend, POS terminal, kitchen display, customer-facing display, self-ordering experience, and reporting dashboard** into one unified ecosystem.

It is designed to make café operations faster, clearer, and more connected — from the moment an employee opens a table to the moment an order is prepared, paid, and recorded.

---

## ✦ Overview

Traditional café POS systems often separate ordering, kitchen operations, payments, and reporting into disconnected workflows.

OFFLINE CLUB brings these operations together through a single system.

```text
ADMIN
  ↓
Configure Products, Employees, Tables & Payments
  ↓
POS TERMINAL
  ↓
Take Orders → Apply Discounts → Send to Kitchen
  ↓
KITCHEN DISPLAY
  ↓
To Cook → Preparing → Completed
  ↓
PAYMENT
  ↓
Cash / Card / UPI
  ↓
RECEIPT + CUSTOMER DISPLAY
  ↓
REPORTING & ANALYTICS
```

The platform also supports **QR-based self-ordering**, allowing customers to browse the menu and place orders directly from their table.

---

## ✦ Core Features

### POS Terminal

* Table and floor selection
* Product search
* Category-based product filtering
* Cart management
* Quantity adjustment
* Customer assignment
* Coupon application
* Automatic promotions
* Kitchen order submission
* Payment processing
* Receipt printing
* Email receipt delivery

### Product Management

Administrators can:

* Create products
* Edit products
* Delete products
* Assign categories
* Configure prices
* Configure units of measure
* Configure taxes
* Add product descriptions

### Category Management

* Create, edit, and delete categories
* Assign category colors
* Automatically reflect category colors throughout the POS

### Floor & Table Management

* Create multiple floors
* Add tables to floors
* Configure table numbers
* Configure seating capacity
* Activate or deactivate tables
* View table availability in real time

### Payment Methods

Supported payment methods:

* Cash
* Card / Digital Payment
* UPI QR

UPI payments dynamically generate a QR code using the configured UPI ID.

### Coupons & Promotions

#### Coupon Codes

Employees can manually enter coupon codes during checkout.

Supported discount types:

* Percentage discount
* Fixed amount discount

#### Automated Promotions

Promotions can automatically trigger based on:

* Minimum product quantity
* Minimum order value

---

## ✦ Kitchen Display System

The Kitchen Display System provides a dedicated interface for kitchen staff.

Orders are received in real time after being sent from the POS terminal.

### Order Stages

```text
TO COOK
   ↓
PREPARING
   ↓
COMPLETED
```

Kitchen staff can:

* View order tickets
* Track ordered quantities
* Move orders between stages
* Mark individual items as completed
* Search orders
* Filter by product
* Filter by category

---

## ✦ Customer-Facing Display

A dedicated customer display keeps customers informed throughout checkout.

### Order View

Displays:

* Products
* Quantities
* Prices
* Subtotal
* Tax
* Discounts
* Total

### Payment View

Displays:

* Payment information
* Payable amount
* UPI QR code when applicable

### Completion View

Displays a payment confirmation and thank-you message after successful checkout.

---

## ✦ Self Ordering

Customers can order directly from their table using a QR code.

Administrators can enable:

* **Online Ordering**
* **QR Menu**

Each table receives a unique QR code.

```text
Table
  ↓
Unique QR Code
  ↓
/s/<unique-token>
  ↓
Digital Menu
  ↓
Cart
  ↓
Order
  ↓
Kitchen Display
```

Customers can:

* Browse products
* Add products to cart
* Apply coupon codes
* Place orders
* Track order status

QR codes can also be exported as PDFs for printing and placing on tables.

---

## ✦ Customer Management

Employees can manage customers directly from the POS terminal.

Customer information includes:

* Name
* Email
* Phone number

Customers can be created, edited, deleted, and attached to orders.

Their email can also be used for receipt delivery.

---

## ✦ Orders

The Orders module provides session-based order management.

Each order contains:

* Order number
* Date
* Customer
* Amount
* Status

Supported statuses:

```text
DRAFT
PAID
CANCELLED
```

Draft orders can be edited or deleted, while paid orders are available for viewing.

---

## ✦ Dashboard & Reporting

The reporting dashboard provides real-time operational and sales insights.

### Filters

* Today
* This Week
* This Month
* Custom date range
* Employee
* Session
* Product

### Key Metrics

* Total Orders
* Revenue
* Average Order Value

### Analytics

* Sales Trend
* Top Categories
* Top Orders
* Top Products
* Category-wise Revenue

Reports can be exported as:

* PDF
* XLS

---

## ✦ User Roles

The system is structured around three primary roles.

### User / Admin

Responsible for:

* Product configuration
* Categories
* Employees
* Tables and floors
* Payment methods
* Coupons and promotions
* Self-ordering
* Bookings
* Reports
* System management

### Employee / Cashier

Responsible for:

* Opening POS sessions
* Managing tables
* Taking orders
* Assigning customers
* Applying coupons
* Sending orders to the kitchen
* Processing payments
* Managing receipts

### Customer

Interacts with the system through:

* Self-ordering
* Digital menu
* Order tracking
* Customer-facing display

---

## ✦ Design Direction

OFFLINE CLUB follows a **cinematic editorial café aesthetic** rather than a conventional restaurant dashboard.

The visual language is built around:

* Dark luxury
* Editorial typography
* Large negative space
* Product-focused imagery
* Minimal UI chrome
* Warm accent colors
* Subtle motion
* Strong visual hierarchy

### Primary Palette

| Token          | Value     |
| -------------- | --------- |
| Background     | `#0B0B0B` |
| Surface        | `#141414` |
| Border         | `#252525` |
| Text Primary   | `#F4F1EA` |
| Text Secondary | `#A3A3A3` |
| Accent         | `#FF6B1A` |

Secondary accent themes include:

* Matcha
* Berry
* Espresso

Only one accent theme is active at a time.

The design system is based on an **8pt spacing system**, rounded components, oversized editorial typography, and subtle cinematic motion.

---

## ✦ Application Architecture

```text
                    ┌────────────────────┐
                    │   ADMIN BACKEND    │
                    │                    │
                    │ Products           │
                    │ Categories         │
                    │ Employees          │
                    │ Tables             │
                    │ Payments           │
                    │ Promotions         │
                    │ Reports            │
                    └─────────┬──────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │    POS TERMINAL    │
                    │                    │
                    │ Tables             │
                    │ Products           │
                    │ Cart               │
                    │ Customers          │
                    │ Payments           │
                    └──────┬───────┬─────┘
                           │       │
                ┌──────────┘       └──────────┐
                ▼                             ▼
       ┌────────────────┐            ┌─────────────────┐
       │ KITCHEN DISPLAY│            │CUSTOMER DISPLAY │
       │                │            │                 │
       │ To Cook        │            │ Order           │
       │ Preparing      │            │ Payment         │
       │ Completed      │            │ Confirmation    │
       └────────────────┘            └─────────────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ SELF ORDERING    │
                  │                  │
                  │ QR Menu          │
                  │ Online Ordering  │
                  └──────────────────┘
```

---

## ✦ Tech Stack

### Frontend

* Next.js
* TypeScript
* Tailwind CSS

### Backend

* Express.js
* REST APIs
* Socket.IO

### Database

* PostgreSQL
* Prisma ORM

### Application Areas

* Authentication
* Role-based access control
* POS operations
* Real-time kitchen workflow
* Payment workflow
* Customer management
* Reporting and analytics
* QR-based self-ordering

---

## ✦ Project Structure

```text
offline-club/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── styles/
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   └── middleware/
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── public/
│
├── README.md
└── package.json
```

> Adjust the folder structure above to match the final repository structure.

---

## ✦ Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd offline-club
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file and configure the required database, authentication, and application variables.

```env
DATABASE_URL=
JWT_SECRET=
```

### 4. Configure the database

```bash
npx prisma migrate dev
```

### 5. Start the development server

```bash
npm run dev
```

If the frontend and backend are configured as separate applications, start both development servers according to their respective package scripts.

---

## ✦ Application Screens

The platform consists of multiple operational interfaces:

```text
Authentication
     │
     ├── Admin Backend
     │     ├── Dashboard
     │     ├── Products
     │     ├── Categories
     │     ├── Payment Methods
     │     ├── Coupons & Promotions
     │     ├── Bookings
     │     ├── Employees
     │     ├── KDS
     │     └── Reports
     │
     ├── POS Terminal
     │     ├── Floor View
     │     ├── Order View
     │     ├── Orders
     │     ├── Customers
     │     └── Payment
     │
     ├── Kitchen Display
     │
     ├── Customer Display
     │
     └── Self Ordering
```

---

## ✦ Design Philosophy

OFFLINE CLUB is built around one simple idea:

> **Technology should make the café experience feel more intentional, not more complicated.**

The interface prioritizes speed for employees, clarity for customers, and visibility for administrators.

Every part of the system is designed around the real operational sequence of a café:

**Select → Order → Prepare → Pay → Complete → Analyze**

---

## ✦ Project Goals

* Build a complete full-stack POS platform
* Connect front-of-house and kitchen workflows
* Provide real-time order updates
* Simplify payment processing
* Enable QR-based self-ordering
* Provide operational visibility through analytics
* Create a scalable restaurant management foundation
* Combine strong product engineering with a distinctive café brand experience

---

## ✦ Status

**Development Status:** Active Development

Core modules include:

* Authentication
* Dashboard
* Products
* Categories
* Employees
* Tables & Floors
* Payment Methods
* POS workflow

Additional modules include:

* Coupons & Promotions
* Bookings
* Orders
* Customers
* Kitchen Display
* Customer Display
* Self Ordering
* Reports & Analytics

---

## ✦ License

This project is developed as a project implementation for the Odoo Cafe POS challenge.

---

## OFFLINE CLUB

**Coffee worth putting your phone down for.**
