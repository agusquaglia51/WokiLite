# WokiLite - Restaurant Reservation System

A modern restaurant reservation system built with a monorepo architecture using Turborepo, featuring a Next.js frontend and Express.js backend with PostgreSQL.

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Design Decisions](#design-decisions)
- [Assumptions](#assumptions)
- [Limitations](#limitations)
- [Project Structure](#project-structure)

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

### Endpoints

#### **Restaurants**

##### Get All Restaurants

```http
GET /restaurants
```

**Response**:

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

**Response**: Single restaurant object

#### **Availability**

##### Check Availability

```http
GET /availability?restaurantId={id}&sectorId={id}&date={YYYY-MM-DD}&partySize={number}
```

**Query Parameters**:

- `restaurantId` (required): Restaurant ID
- `sectorId` (required): Sector ID
- `date` (required): Date in YYYY-MM-DD format
- `partySize` (required): Number of guests

**Response**:

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

#### **Reservations**

##### Create Reservation

```http
POST /reservation/create
```

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

**Response**:

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

##### Cancel Reservation

```http
PUT /reservation/cancel/:id
```

**Response**: Updated reservation with status "CANCELLED"

---

## 🏗 Design Decisions

### 1. **Monorepo Architecture**

- Used Turborepo for efficient builds and caching
- Shared types between frontend and backend
- Independent deployment of services

### 2. **Database Design**

- Single table per entity (Restaurant, Sector, Table, Reservation)
- Denormalized customer data in Reservation table for simplicity
- Idempotency keys stored separately for duplicate request handling

### 3. **Reservation Duration**

- Fixed 90-minute duration per reservation
- 15-minute time slot intervals for availability checks

### 4. **Timezone Handling**

- Each restaurant has its own timezone
- All dates stored as ISO 8601 strings with timezone offset
- Day.js with timezone plugin for conversions

### 5. **Idempotency**

- UUID-based idempotency keys prevent duplicate reservations
- Keys stored in separate table linked to reservations
- Implemented at transaction level for consistency

### 6. **Table Assignment**

- Automatic table assignment based on party size
- Tables filtered by minSize/maxSize capacity
- Prioritizes smallest suitable table

### 7. **API Error Handling**

- Structured error responses with error codes
- Validation using Zod schemas
- Logging with Pino for debugging

---

## 🔍 Assumptions

1. **Reservation Duration**: All reservations last exactly 90 minutes
2. **Single Table Assignment**: Each reservation is assigned to exactly one table (no table combinations)
3. **Operating Hours**: Restaurants define operating hours via "shifts" array
4. **No Authentication**: System is open - no user authentication implemented
5. **Same-Day Bookings**: Customers can book for the current day
6. **Immediate Confirmation**: All valid reservations are immediately confirmed
7. **No Cancellation Window**: Reservations can be cancelled at any time
8. **Capacity Checks**: Tables must match party size within min/max range
9. **Timezone Consistency**: All times for a restaurant use its configured timezone
10. **No Waitlist**: If no tables available, reservation is rejected

---

## ⚠️ Limitations

### Current Implementation

1. **No User Authentication**
   - No login/signup system
   - Anyone can create/cancel reservations
   - No user profiles or reservation history

2. **Single Table Assignment**
   - Cannot combine multiple tables for large parties
   - Large groups may not find availability

3. **Fixed Reservation Duration**
   - All reservations are 90 minutes
   - No custom duration options

4. **No Payment Integration**
   - No deposits or prepayment
   - No cancellation fees

5. **No Real-Time Updates**
   - Frontend doesn't automatically refresh availability
   - Manual page refresh required

6. **Limited Search**
   - Search functionality not fully implemented
   - No filtering by cuisine, location, or price

7. **No Notifications**
   - No email/SMS confirmations
   - No reminder notifications

8. **Basic Error Handling**
   - Some edge cases may not be covered
   - Error messages could be more descriptive

9. **No Admin Dashboard**
   - Restaurant owners cannot manage their listings
   - No reservation management interface

10. **No Reviews/Ratings**
    - No customer feedback system
    - No restaurant ratings

### Performance Considerations

- No caching implemented (Redis)
- No rate limiting
- No database connection pooling optimization
- No CDN for static assets
- No lazy loading for large datasets

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

## 🧪 Testing

Currently, testing infrastructure is set up but tests are not implemented:

```bash
# Run tests (when implemented)
npm run test
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

### Port Already in Use

If ports 3000 or 3001 are in use:

```bash
# Find process using port
lsof -i :3000
lsof -i :3001

# Kill process
kill -9 <PID>
```

Or change ports in `.env` files.

### CORS Issues

If you encounter CORS errors, verify:

- Backend CORS configuration in `server.ts`
- Frontend API URL in `.env.local`
- Both services are running

---

## 📝 Future Improvements

1. **User Authentication & Authorization**
2. **Real-time availability updates** (WebSockets)
3. **Email/SMS notifications**
4. **Payment integration**
5. **Admin dashboard** for restaurant management
6. **Review and rating system**
7. **Advanced search and filters**
8. **Multi-table reservations**
9. **Flexible reservation durations**
10. **Mobile app** (React Native)
11. **Comprehensive testing** (unit, integration, e2e)
12. **Performance optimizations** (caching, CDN)
13. **Analytics dashboard**
14. **Waitlist functionality**
15. **Special requests handling**

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
