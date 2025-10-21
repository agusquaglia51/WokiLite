# WokiLite - Restaurant Reservation System

A modern restaurant reservation system built with a monorepo architecture using Turborepo, featuring a Next.js frontend and Express.js backend with PostgreSQL.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Design Decisions](#design-decisions)
- [Assumptions](#assumptions)
- [Limitations](#limitations)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Future Improvements](#future-improvements)

---

## 🚀 Quick Start

```bash
# Clone and install
git clone <repository-url>
cd WokiLite
npm install

# Setup environment
cd apps/backend
cp .env.example .env

cd ../frontend
touch .env.local

# Run the application
cd ../..
npm run dev
```

Access the application at:

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

---

## 🛠 Tech Stack

### Backend

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 5.x
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod
- **Logging**: Pino
- **Date Management**: Day.js with timezone support

### Frontend

- **Framework**: Next.js 15.5 (App Router)
- **UI**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4.x
- **Date Picker**: react-datepicker

### Monorepo

- **Tool**: Turborepo
- **Package Manager**: npm

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.x
- **npm** >= 11.6.0
- **PostgreSQL** >= 14.x
- **Git**

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd WokiLite
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup PostgreSQL Database

Make sure PostgreSQL is running on your machine. The default configuration expects:

- **Host**: localhost
- **Port**: 5432
- **User**: postgres
- **Password**: admin

You can modify these in the `.env` file if needed.

### 4. Configure Environment Variables

#### Backend Configuration

Create a `.env` file in `apps/backend/`:

```bash
cd apps/backend
cp .env.example .env
```

The `.env` file should contain:

```env
DATABASE_URL="postgresql://postgres:admin@localhost:5432/wokilitedb"
PORT=3001
PG_USER=postgres
PG_PASSWORD=admin
PG_HOST=localhost
PG_PORT=5432
DB_NAME=wokilitedb
NODE_ENV=development
```

#### Frontend Configuration

Create a `.env.local` file in `apps/frontend/`:

```bash
cd apps/frontend
touch .env.local
```

Add the following:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_URL=http://localhost:3000
NODE_ENV=development
```

### 5. Initialize Database

The application will automatically create the database on first run, but you can also do it manually:

```bash
cd apps/backend

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed the database (if seed file exists)
npx prisma db seed
```

---

## 🎯 Running the Application

### Development Mode (Recommended)

From the root directory, run both frontend and backend simultaneously:

```bash
npm run dev
```

This will start:

- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:3000

### Running Services Individually

#### Backend Only

```bash
cd apps/backend
npm run dev
```

#### Frontend Only

```bash
cd apps/frontend
npm run dev
```

### Production Build

```bash
# Build all apps
npm run build

# Start frontend in production
cd apps/frontend
npm start
```

---

## 📚 API Documentation

### Base URL

```
http://localhost:3001
```

### Error Handling

All API responses follow a consistent error format:

```json
{
  "error": "error_code",
  "message": "Human-readable error message"
}
```

### Endpoints

#### **Restaurants**

##### Get All Restaurants

```http
GET /restaurants
```

**Description**: Retrieves a list of all available restaurants.

**Response** (200 OK):

```json
[
  {
    "id": "R1",
    "name": "Restaurant Name",
    "timezone": "America/Argentina/Buenos_Aires",
    "shifts": [
      { "start": "12:00", "end": "15:00" },
      { "start": "20:00", "end": "23:00" }
    ],
    "createdAt": "2025-01-20T10:00:00Z",
    "updatedAt": "2025-01-20T10:00:00Z"
  }
]
```

##### Get Restaurant by ID

```http
GET /restaurants/:id
```

**Description**: Retrieves details for a specific restaurant.

**Path Parameters**:

- `id` (required): Restaurant ID

**Response** (200 OK): Single restaurant object (same structure as above)

**Error Responses**:

- `404 Not Found`: Restaurant not found

#### **Availability**

##### Check Availability

```http
GET /availability?restaurantId={id}&sectorId={id}&date={YYYY-MM-DD}&partySize={number}
```

**Description**: Checks available time slots for a restaurant sector on a given date.

**Query Parameters**:

- `restaurantId` (required): Restaurant ID
- `sectorId` (required): Sector ID
- `date` (required): Date in YYYY-MM-DD format
- `partySize` (required): Number of guests (must be between 1 and max table capacity)

**Response** (200 OK):

```json
{
  "slotMinutes": 15,
  "durationMinutes": 90,
  "slots": [
    {
      "start": "2025-09-08T12:00:00-03:00",
      "available": true,
      "tables": ["Table 1", "Table 2"]
    },
    {
      "start": "2025-09-08T12:15:00-03:00",
      "available": false,
      "reason": "no_capacity"
    }
  ]
}
```

**Error Responses**:

- `400 Bad Request`: Invalid parameters or date format
- `404 Not Found`: Restaurant or sector not found

#### **Reservations**

##### Create Reservation

```http
POST /reservation/create
```

**Description**: Creates a new reservation. Idempotency is supported via the `Idempotency-Key` header.

**Headers**:

```
Content-Type: application/json
Idempotency-Key: {unique-uuid}
```

**Request Body**:

```json
{
  "restaurantId": "R1",
  "sectorId": "S1",
  "partySize": 4,
  "startDateTimeISO": "2025-09-08T20:00:00-03:00",
  "customer": {
    "name": "John Doe",
    "phone": "+1234567890",
    "email": "john@example.com"
  },
  "notes": "Window seat preferred"
}
```

**Response** (201 Created):

```json
{
  "id": "uuid",
  "restaurantId": "R1",
  "sectorId": "S1",
  "tableIds": ["T1"],
  "partySize": 4,
  "startDateTimeISO": "2025-09-08T20:00:00-03:00",
  "endDateTimeISO": "2025-09-08T21:30:00-03:00",
  "status": "CONFIRMED",
  "customerName": "John Doe",
  "customerPhone": "+1234567890",
  "customerEmail": "john@example.com",
  "notes": "Window seat preferred",
  "createdAt": "2025-01-20T10:00:00Z",
  "updatedAt": "2025-01-20T10:00:00Z"
}
```

**Error Responses**:

- `400 Bad Request`: Invalid input or validation error
- `409 Conflict`: No available tables for the requested time and party size
- `422 Unprocessable Entity`: Duplicate reservation detected (same idempotency key)
- `500 Internal Server Error`: Server error

##### Cancel Reservation

```http
PUT /reservation/cancel/:id
```

**Description**: Cancels an existing reservation.

**Path Parameters**:

- `id` (required): Reservation ID

**Response** (200 OK): Updated reservation with status "CANCELLED"

```json
{
  "id": "uuid",
  "status": "CANCELLED",
  "updatedAt": "2025-01-20T10:05:00Z"
}
```

**Error Responses**:

- `404 Not Found`: Reservation not found
- `400 Bad Request`: Reservation already cancelled

---

## 🏗 Design Decisions

### 1. Monorepo Architecture with Turborepo

We chose a monorepo structure to maintain shared types, utilities, and configurations across frontend and backend. Turborepo provides efficient incremental builds and caching, enabling faster development cycles. This approach allows independent deployment while maintaining code consistency.

### 2. Database Schema Design

The database uses separate tables for each entity (Restaurant, Sector, Table, Reservation, IdempotencyKey). Customer data is denormalized within the Reservation table to simplify queries and reduce joins. This trade-off prioritizes query performance over strict normalization.

### 3. Fixed Reservation Duration

All reservations have a fixed 90-minute duration. This simplifies capacity planning and availability calculations. Time slot intervals are set to 15 minutes, providing granular availability options without excessive complexity.

### 4. Timezone Handling Strategy

Each restaurant maintains its own timezone configuration. All dates are stored and transmitted as ISO 8601 strings with timezone offsets. Day.js with the timezone plugin handles conversions, ensuring consistent behavior across different regions.

### 5. Idempotency Implementation

Idempotency keys (UUIDs) prevent duplicate reservations from concurrent requests. Keys are stored in a separate table and checked at the transaction level, ensuring data consistency. Clients must provide unique keys via the `Idempotency-Key` header.

### 6. Automatic Table Assignment

Tables are automatically assigned based on party size, matching capacity constraints (minSize/maxSize). The system prioritizes the smallest suitable table to optimize capacity usage. Manual table assignment is not supported in the current implementation.

### 7. Structured Error Handling

The API implements consistent error responses with specific error codes. Zod handles input validation with detailed messages. Pino logging provides debugging information without exposing sensitive details to clients.

### 8. Stateless API Design

The backend is designed as a stateless REST API, enabling horizontal scaling. Authentication is not implemented, making the system suitable for public-facing reservations.

---

## 🔍 Assumptions

1. **Reservation Duration**: All reservations last exactly 90 minutes regardless of party size or time of day.

2. **Single Table Assignment**: Each reservation is assigned to exactly one table. Multi-table combinations are not supported.

3. **Operating Hours**: Restaurants define operating hours through a "shifts" array containing start and end times.

4. **No Authentication Required**: The system is open to all users. No login or user authentication is implemented.

5. **Same-Day Bookings**: Customers can make reservations for the current day if slots are available.

6. **Immediate Confirmation**: All valid reservations are automatically confirmed. No manual approval process exists.

7. **No Cancellation Window**: Reservations can be cancelled at any time, regardless of proximity to the reservation date.

8. **Capacity-Based Table Matching**: Tables must accommodate the party size within their minimum and maximum capacity range.

9. **Restaurant Timezone Consistency**: All times for a restaurant use its configured timezone exclusively.

10. **No Waitlist Functionality**: If no suitable tables are available, the reservation request is rejected. Customers are not placed on a waiting list.

11. **Idempotency by Request**: The same request with the same `Idempotency-Key` returns the same result without creating duplicate reservations.

12. **Date Format Consistency**: All date parameters use YYYY-MM-DD format. Time parameters include timezone offset in ISO 8601 format.

---

## ⚠️ Limitations

### Current Implementation

**Authentication & Authorization**

- No user authentication system
- No role-based access control
- Anyone can create or cancel any reservation
- No user profiles or reservation history per user

**Reservation Management**

- Single table assignment only (cannot combine multiple tables)
- Large parties may fail to find availability if no single table is large enough
- Fixed 90-minute reservation duration (no custom durations available)
- No deposit or prepayment system
- No cancellation fees or penalties
- Reservations cannot be modified after creation (must cancel and rebook)

**User Experience**

- No real-time availability updates (frontend requires manual page refresh)
- No search functionality by cuisine, location, price range, or other filters
- No email or SMS confirmations for reservations
- No reminder notifications before reservation time
- No customer reviews or ratings system

**Restaurant Management**

- No admin dashboard for restaurant owners
- Restaurants cannot manage their own listings or hours
- No ability to manually block time slots or mark unavailable tables
- No reservation management interface for staff
- No analytics or reporting for restaurant owners

**System Features**

- No payment integration or billing
- No integration with third-party services
- No API rate limiting (vulnerable to abuse)
- No caching mechanism (Redis not implemented)
- No CDN for static assets
- No lazy loading for large datasets
- No data export functionality

**Performance Considerations**

- Database connection pooling not optimized for high load
- No query optimization or indexing beyond basic setup
- No static asset caching headers
- Single-instance deployment (no horizontal scaling considered)

**Data & Security**

- Sensitive information (phone, email) stored in plain text
- No data encryption at rest or in transit (if deployed over HTTP)
- No audit logging for administrative actions
- CORS configured but not production-hardened
- No input sanitization against injection attacks

---

## 🌐 Deployment

### Current Status

**The application is not currently deployed publicly.** This is a development version meant to run locally.

### Preparing for Deployment

To deploy this application to production, consider the following:

1. **Environment Configuration**: Set appropriate environment variables for production databases, API URLs, and security settings.

2. **Database Migration**: Use a managed PostgreSQL service (AWS RDS, DigitalOcean, Heroku) rather than self-hosted.

3. **Backend Deployment**: Deploy to a Node.js hosting platform like Vercel, Railway, Heroku, or AWS Lambda.

4. **Frontend Deployment**: Deploy the Next.js frontend to Vercel or similar platform.

5. **Security Hardening**: Implement HTTPS, add authentication, rate limiting, and input validation.

6. **Monitoring**: Set up error tracking (Sentry), performance monitoring (New Relic), and logging aggregation.

### Deployment Platforms (Recommended)

- **Frontend**: Vercel, Netlify, or AWS Amplify
- **Backend**: Railway, Render, Heroku, or AWS ECS
- **Database**: AWS RDS, DigitalOcean Managed Database, or Heroku Postgres

### Public URL

Once deployed, the public URL will be available here. For now, the application is only accessible locally at `http://localhost:3000`.

---

## 📁 Project Structure

```
WokiLite/
├── apps/
│   ├── backend/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   ├── src/
│   │   │   ├── db/
│   │   │   │   ├── index.ts
│   │   │   │   └── prismaClient.ts
│   │   │   ├── repositories/
│   │   │   │   ├── restaurant.repository.ts
│   │   │   │   ├── sector.repository.ts
│   │   │   │   ├── table.repository.ts
│   │   │   │   ├── reservation.repository.ts
│   │   │   │   └── idempotency.repository.ts
│   │   │   ├── routes/
│   │   │   │   ├── restaurant.route.ts
│   │   │   │   ├── availability.route.ts
│   │   │   │   └── reservation.route.ts
│   │   │   ├── services/
│   │   │   │   ├── restaurant.service.ts
│   │   │   │   └── reservation.service.ts
│   │   │   ├── schemas/
│   │   │   │   └── reservationSchema.ts
│   │   │   ├── types/
│   │   │   │   └── types.ts
│   │   │   ├── utils/
│   │   │   │   └── time.ts
│   │   │   └── server.ts
│   │   ├── .env.example
│   │   └── package.json
│   │
│   └── frontend/
│       ├── src/
│       │   └── app/
│       │       ├── [id]/
│       │       │   └── page.tsx
│       │       ├── components/
│       │       │   ├── RestaurantCard.tsx
│       │       │   └── SearchBox.tsx
│       │       ├── services/
│       │       │   └── restaurant.service.ts
│       │       ├── types.ts
│       │       ├── utils.ts
│       │       ├── globals.css
│       │       ├── layout.tsx
│       │       └── page.tsx
│       ├── .env.local
│       └── package.json
│
├── package.json
├── turbo.json
└── README.md
```

---

## 🔧 Troubleshooting

### Database Connection Issues

If you encounter database connection errors:

1. Verify PostgreSQL is running:

```bash
# Linux/Mac
sudo systemctl status postgresql

# Or check with psql
psql -U postgres -h localhost
```

2. Check credentials in `.env` file
3. Ensure database exists:

```bash
psql -U postgres -c "CREATE DATABASE wokilitedb;"
```

4. Test connection:

```bash
psql -U postgres -d wokilitedb -h localhost
```

### Port Already in Use

If ports 3000 or 3001 are in use:

```bash
# Find process using port
lsof -i :3000
lsof -i :3001

# Kill process (use appropriate command for your OS)
kill -9 <PID>
```

Or change ports in `.env` files and `next.config.js`.

### CORS Issues

If you encounter CORS errors:

- Verify backend CORS configuration in `server.ts`
- Ensure frontend API URL in `.env.local` matches backend URL
- Confirm both services are running
- Check browser console for specific error messages

### Database Migration Errors

If migrations fail:

```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or manually drop and recreate
psql -U postgres -c "DROP DATABASE wokilitedb;"
psql -U postgres -c "CREATE DATABASE wokilitedb;"
npx prisma migrate deploy
```

### Build Errors

If you encounter build errors:

```bash
# Clear node_modules and reinstall
rm -rf node_modules apps/*/node_modules
npm install

# Clear build cache
rm -rf apps/*/dist apps/*/.next
npm run build
```

---

## 📝 Future Improvements

1. User authentication and authorization system
2. Real-time availability updates via WebSockets
3. Email and SMS notifications for confirmations and reminders
4. Payment integration (Stripe, PayPal)
5. Admin dashboard for restaurant management
6. Customer review and rating system
7. Advanced search and filtering capabilities
8. Multi-table reservations for large groups
9. Flexible reservation durations
10. Mobile app (React Native or Flutter)
11. Comprehensive testing (unit, integration, e2e)
12. Performance optimizations (caching, CDN, database indexing)
13. Analytics dashboard for restaurants
14. Waitlist functionality
15. Special requests and dietary preferences handling
16. Promotional codes and discounts
17. Integration with restaurant POS systems
18. API key management for partner integrations

---

## 👥 Contributors

- Agustin Quagliarella

---

## 📄 License

ISC

---

## 🆘 Support

For issues and questions:

- Open an issue on GitHub
- Contact: [your-email@example.com]

---

**Happy Coding! 🚀**
