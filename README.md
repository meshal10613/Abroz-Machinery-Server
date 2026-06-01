# Abroz Machinery Server

[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://mongoosejs.com/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

A production-ready RESTful API server for the **Abroz Machinery** platform — a machinery catalogue and admin management system. Built with **Express 5**, **TypeScript**, **MongoDB**, and **Redis**, featuring JWT authentication, Cloudinary image storage, OTP-based password recovery, and a full analytics/dashboard engine.

---

## Table of Contents

- [Abroz Machinery Server](#abroz-machinery-server)
	- [Table of Contents](#table-of-contents)
	- [Features](#features)
	- [Tech Stack](#tech-stack)
	- [Project Structure](#project-structure)
	- [Environment Variables](#environment-variables)
	- [API Reference](#api-reference)
		- [Auth Routes — `/api/v1/auth`](#auth-routes--apiv1auth)
		- [User Routes — `/api/v1/user`](#user-routes--apiv1user)
		- [Admin Routes — `/api/v1/admin`](#admin-routes--apiv1admin)
		- [Category Routes — `/api/v1/category`](#category-routes--apiv1category)
		- [Product Routes — `/api/v1/product`](#product-routes--apiv1product)
		- [Stats Routes — `/api/v1/stats`](#stats-routes--apiv1stats)
	- [Getting Started — Local Development](#getting-started--local-development)
		- [Prerequisites](#prerequisites)
		- [1. Clone the repository](#1-clone-the-repository)
		- [2. Install dependencies](#2-install-dependencies)
		- [3. Configure environment variables](#3-configure-environment-variables)
		- [4. Run the development server](#4-run-the-development-server)
		- [5. Build for production](#5-build-for-production)
	- [Running with Docker](#running-with-docker)
		- [Prerequisites](#prerequisites-1)
		- [1. Clone the repository](#1-clone-the-repository-1)
		- [2. Configure environment variables](#2-configure-environment-variables)
		- [3. Build and start all services](#3-build-and-start-all-services)
		- [4. Access the API](#4-access-the-api)
		- [5. Useful Docker commands](#5-useful-docker-commands)
	- [Architecture Overview](#architecture-overview)
	- [Authentication \& Authorization](#authentication--authorization)
	- [CORS](#cors)
	- [License](#license)

---

## Features

- **JWT Authentication** — Secure login with access tokens delivered via HTTP-only cookies
- **OTP Password Recovery** — Email-based one-time password flow for forgotten passwords
- **Role-Based Access Control** — `ADMIN` role guard on protected routes
- **Product Catalogue** — Full CRUD with multi-image upload (up to 5 images per product), search, filter, pagination, and per-product view analytics
- **Category Management** — Hierarchical product categorisation with admin-only write access
- **Cloudinary Integration** — Automatic image upload and cleanup on update/delete
- **Dashboard Analytics** — Products, categories, WhatsApp/Messenger click counts with day-over-day growth percentages and a 30-day click trend chart
- **Admin Seeding** — First-run auto-seed of the admin user from environment variables
- **Redis** — Ready for caching and session management
- **Nginx Load Balancer** — Docker Compose spins up 5 replicas behind an Nginx reverse proxy
- **Global Error Handling** — Zod validation errors, `AppError`, and unexpected errors all return consistent JSON responses

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 22 (Alpine) |
| Language | TypeScript 5 |
| Framework | Express 5 |
| Database | MongoDB via Mongoose 9 |
| Cache | Redis 7 |
| Auth | JSON Web Tokens (`jsonwebtoken`) |
| Password Hashing | `bcryptjs` |
| Image Storage | Cloudinary + `multer-storage-cloudinary` |
| Email | Nodemailer (SMTP) with EJS templates |
| Validation | Zod 4 |
| Build Tool | `tsup` (esbuild-based) |
| Containerisation | Docker + Docker Compose + Nginx |
| Package Manager | pnpm |

---

## Project Structure

```
src/
├── app.ts                        # Express app setup
├── server.ts                     # Entry point — DB connect, Redis connect, listen
└── app/
    ├── builder/
    │   └── queryBuilder.ts       # Chainable query builder (search, filter, paginate, fields, populate)
    ├── config/
    │   ├── env.ts                # Validated environment config (throws on missing vars)
    │   ├── cloudinary.ts         # Cloudinary SDK setup + delete helper
    │   ├── multer.ts             # Multer + Cloudinary storage config
    │   └── redis.ts              # Redis client
    ├── helper/
    │   ├── AppError.ts           # Custom HTTP error class
    │   ├── activity.helper.ts    # Activity log writer
    │   └── handleZodError.ts     # Zod error → standard error shape
    ├── interface/
    │   └── error.interface.ts    # Shared error response interface
    ├── middlewares/
    │   ├── globalErrorHandler.ts # Central error handler (Zod, AppError, unknown)
    │   ├── notFound.ts           # 404 catch-all
    │   ├── zodValidation.ts      # Zod validation middleware
    │   └── zodValidationWithCleanup.ts # Zod validation + Cloudinary cleanup on failure
    ├── models/
    │   ├── admin.model.ts        # Admin profile + WhatsApp/Messenger analytics
    │   ├── user.model.ts         # User (bcrypt pre-save hook, comparePassword method)
    │   ├── product.model.ts      # Product with per-day click analytics
    │   ├── category.model.ts     # Product category
    │   ├── activity.model.ts     # Admin activity log
    │   └── stats.model.ts        # General stats schema
    ├── modules/
    │   ├── auth/                 # Login, password recovery, OTP verify, change password
    │   ├── admin/                # Admin profile info, update, click tracking
    │   ├── user/                 # User profile update (with avatar upload)
    │   ├── category/             # Category CRUD
    │   ├── product/              # Product CRUD + image upload + click analytics
    │   └── stats/                # Dashboard analytics aggregation
    ├── routes/
    │   └── index.ts              # Central route aggregator → /api/v1
    ├── seeds/
    │   └── admin.seed.ts         # Idempotent admin user seeder
    ├── shared/
    │   ├── catchAsync.ts         # Async route wrapper
    │   └── sendResponse.ts       # Uniform JSON response helper
    ├── templates/
    │   └── otp.ejs               # HTML email template for OTP delivery
    ├── types/                    # Shared TypeScript types
    └── utils/
        ├── cookie.ts             # Cookie options helper
        ├── email.ts              # Nodemailer send helper
        ├── generateOtp.ts        # OTP + expiry generator
        ├── jwt.ts                # JWT sign / verify wrappers
        └── token.ts              # Token generation helper
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in all values. Every variable is required — the server throws on startup if any are missing.

```env
# Server
PORT=5000

# MongoDB
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/abroz

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d

# Default admin (auto-seeded on first run)
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=securepassword

# Cloudinary
CLOUDINARY_CLOUDE_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SMTP (email / OTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=you@example.com
SMTP_PASS=your_smtp_password
SMTP_FROM=no-reply@example.com

# Redis
REDIS_HOST=127.0.0.1   # use "redis" when running inside Docker Compose
REDIS_PORT=6379
```

> **Note:** When running via Docker Compose, set `REDIS_HOST=redis` to use the container's internal network hostname.

---

## API Reference

All endpoints are prefixed with `/api/v1`. The root path `GET /` returns a health-check JSON with the process PID and hostname.

---

### Auth Routes — `/api/v1/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/login` | Public | Authenticate with email + password. Returns a JWT and user object. Sets an HTTP-only cookie. |
| `POST` | `/forget-password` | Public | Send a 6-digit OTP to the user's email for password recovery. |
| `POST` | `/verify-email` | Public | Verify the OTP received via email. Must be done before resetting the password. |
| `POST` | `/reset-password` | Public | Reset the password after OTP verification. |
| `GET` | `/me` | 🔒 Admin | Return the currently authenticated user's profile (merged with admin data if applicable). |
| `PATCH` | `/change-password` | 🔒 Admin | Change the current user's password (requires current password + new password). |

**`POST /login` — Request Body**
```json
{
  "email": "admin@example.com",
  "password": "securepassword"
}
```

**`POST /forget-password` — Request Body**
```json
{ "email": "admin@example.com" }
```

**`POST /verify-email` — Request Body**
```json
{ "email": "admin@example.com", "otp": "482910" }
```

**`POST /reset-password` — Request Body**
```json
{ "email": "admin@example.com", "newPassword": "newSecurePass123" }
```

**`PATCH /change-password` — Request Body**
```json
{ "currentPassword": "oldPass", "newPassword": "newPass" }
```

---

### User Routes — `/api/v1/user`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `PATCH` | `/profile` | 🔒 Any authenticated user | Update the user's name or avatar. Accepts `multipart/form-data` with an optional `image` field (single file). |

---

### Admin Routes — `/api/v1/admin`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/info` | Public | Retrieve the admin's public profile information (name, bio, contact links, etc.). |
| `PATCH` | `/profile` | 🔒 Admin | Update the admin's profile details (name, bio, social links, etc.). |
| `PATCH` | `/clicks` | Public | Increment a WhatsApp or Messenger click counter. Called client-side when a visitor taps a contact button. |

**`PATCH /clicks` — Request Body**
```json
{ "type": "whatsapp" }
// or
{ "type": "messenger" }
```

---

### Category Routes — `/api/v1/category`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/` | 🔒 Admin | Create a new product category. |
| `GET` | `/` | Public | Retrieve all categories. |
| `GET` | `/:id` | Public | Retrieve a single category by ID. |
| `PATCH` | `/:id` | 🔒 Admin | Update a category by ID. |
| `DELETE` | `/:id` | 🔒 Admin | Delete a category by ID. |

**`POST /` — Request Body**
```json
{ "name": "Excavators" }
```

---

### Product Routes — `/api/v1/product`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/` | 🔒 Admin | Create a new product. Accepts `multipart/form-data`; up to **5 images** uploaded directly to Cloudinary. |
| `GET` | `/` | Public | List all products with search, filtering, field selection, and pagination support. |
| `GET` | `/:id` | Public | Retrieve a single product by ID. **Automatically increments the product's view count and records the click date.** |
| `PATCH` | `/:id` | 🔒 Admin | Update a product. If new images are provided, old Cloudinary images are deleted automatically. Accepts `multipart/form-data`. |
| `DELETE` | `/:id` | 🔒 Admin | Delete a product and remove all associated images from Cloudinary. |

**Query Parameters for `GET /`**

| Parameter | Type | Description |
|-----------|------|-------------|
| `searchTerm` | `string` | Full-text search across `name`, `origin`, `brandName`, `partNumber` |
| `categoryId` | `string` | Filter by category ID |
| `page` | `number` | Page number (default: `1`) |
| `limit` | `number` | Items per page (default: `10`) |
| `fields` | `string` | Comma-separated list of fields to return |

**`POST /` — Form Fields**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | ✅ | Product name |
| `categoryId` | `string` | ✅ | MongoDB ObjectId of the category |
| `origin` | `string` | ✅ | Country of origin |
| `brandName` | `string` | ✅ | Brand name |
| `partNumber` | `string` | ✅ | Manufacturer part number |
| `description` | `string` | Optional | Product description |
| `images` | `File[]` | Optional | Up to 5 image files (uploaded to Cloudinary) |

---

### Stats Routes — `/api/v1/stats`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/dashboard` | 🔒 Admin | Returns the full dashboard analytics payload. |

**Dashboard Response Shape**
```json
{
  "products": {
    "total": 120,
    "todayCount": 3,
    "growthPercent": 50
  },
  "categories": {
    "total": 12,
    "todayCount": 1,
    "growthPercent": 0
  },
  "whatsappClicks": {
    "total": 840,
    "todayCount": 14,
    "growthPercent": 27
  },
  "messengerClicks": {
    "total": 310,
    "todayCount": 5,
    "growthPercent": -17
  },
  "productClicksLast30Days": [
    { "date": "2026-05-01", "count": 42 },
    ...
  ],
  "topViewedProducts": [
    {
      "id": "...",
      "name": "Komatsu PC200",
      "category": "Excavators",
      "images": ["https://..."],
      "totalClicks": 304,
      "growthPercent": 12
    }
  ]
}
```

---

## Getting Started — Local Development

### Prerequisites

- [Node.js 22+](https://nodejs.org/)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- A running [MongoDB](https://www.mongodb.com/try/download/community) instance (local or Atlas)
- A running [Redis](https://redis.io/docs/getting-started/) instance
- A [Cloudinary](https://cloudinary.com/) account

### 1. Clone the repository

```bash
git clone https://github.com/meshal10613/Abroz-Machinery-Server--
cd Abroz-Machinery-Server--
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
# Open .env and fill in all required values
```

### 4. Run the development server

```bash
pnpm dev
```

The server starts with `tsx watch` (hot-reload on file changes) at `http://localhost:<PORT>`.

On first run, the seeder will automatically create the admin user defined in your `.env`.

### 5. Build for production

```bash
pnpm build       # compiles TypeScript → dist/server.js via tsup
pnpm start       # runs the compiled output
```

---

## Running with Docker

The Docker setup includes **5 app replicas**, a **Redis** container, and an **Nginx** reverse proxy with load balancing — all orchestrated by Docker Compose.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed

### 1. Clone the repository

```bash
git clone https://github.com/meshal10613/Abroz-Machinery-Server--
cd Abroz-Machinery-Server--
```

### 2. Configure environment variables

```bash
cp .env.example .env
# Fill in all required values.
# Important: set REDIS_HOST=redis (not 127.0.0.1) for Docker networking
```

### 3. Build and start all services

```bash
docker compose up --build
```

This will:
- Build the Node.js app image from the `Dockerfile`
- Start **5 replicas** of the app container (port `5000` exposed internally)
- Start a **Redis 7** container with persistent volume (`redis_data`)
- Start an **Nginx** container on port **80**, load-balancing across all app replicas

### 4. Access the API

```
http://localhost/api/v1
```

### 5. Useful Docker commands

```bash
# Run in detached mode
docker compose up --build -d

# View logs for all services
docker compose logs -f

# View logs for the app only
docker compose logs -f app

# Stop all services
docker compose down

# Stop and remove volumes (including Redis data)
docker compose down -v
```

---

## Architecture Overview

```
Client
  │
  ▼
Nginx (port 80)
  │  Round-robin load balancing
  ├─► App Replica 1 :5000
  ├─► App Replica 2 :5000
  ├─► App Replica 3 :5000
  ├─► App Replica 4 :5000
  └─► App Replica 5 :5000
         │
         ├── MongoDB Atlas (cloud)
         ├── Redis (container / local)
         └── Cloudinary (cloud CDN)
```

**Request flow inside the app:**

```
HTTP Request
  → Cookie Parser / JSON Body Parser
  → CORS Middleware
  → Router (/api/v1/*)
    → Zod Validation Middleware
    → authenticate() — verifies JWT from cookie or Authorization header
    → authorize(role) — checks UserRole
    → Controller
      → Service (business logic)
        → Mongoose / Redis / Cloudinary
      → sendResponse() — uniform JSON envelope
  → globalErrorHandler (catches all thrown errors)
  → notFound (404 catch-all)
```

---

## Authentication & Authorization

- After a successful `POST /api/v1/auth/login`, the server returns a JWT token in both the JSON response body and as an HTTP-only cookie.
- Include the token in subsequent requests via the cookie (automatic in browsers) **or** the `Authorization` header:
  ```
  Authorization: Bearer <your_token>
  ```
- Protected routes require the `authenticate` middleware, which decodes the token and attaches the user to `req.user`.
- Admin-only routes additionally require `authorize(UserRole.ADMIN)`, which checks `req.user.role`.

---

## CORS

The server currently allows requests from:

- `http://localhost:3000` (local frontend development)
- `https://abroz-admin-dashboard.vercel.app` (production admin dashboard)

To add additional origins, update the `cors` configuration in `src/app.ts`.

---

## License

ISC © [Abroz Machinery](https://github.com/meshal10613/Abroz-Machinery-Server--)