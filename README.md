# Auth Assessment — Full-Stack Authentication App

A full-stack authentication application built with React, C# ASP.NET Core, PostgreSQL, and Docker.

---

## Architecture

```
React (Port 3000) → C# API (Port 5000) → PostgreSQL (Port 5432)
```

All services run in Docker containers orchestrated by Docker Compose.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite, React Router, Axios |
| Backend | C# ASP.NET Core 9, EF Core 9, JWT Auth |
| Database | PostgreSQL 16 |
| DevOps | Docker, Docker Compose |

---

## Prerequisites

- [Docker Desktop](https://docs.docker.com/get-started/get-docker/)
- [.NET 9 SDK](https://dotnet.microsoft.com/download) (for local dev/tests only)
- [Node.js 20+](https://nodejs.org) (for local frontend dev only)

---

## Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd auth-assessment

# Option 1: Use the build script (recommended)
./build.sh

# Option 2: Manual Docker Compose
docker compose up --build -d
```

Then open http://localhost:3000

---

## Running Locally (Without Docker)

### Backend
```bash
cd backend/AuthApi
dotnet run
# API runs on http://localhost:5098
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

> Note: When running locally, ensure PostgreSQL is installed and running with:
> - Database: `authdb`
> - Username: `authuser`
> - Password: `authpassword`

---

## Running Tests

```bash
# Backend unit tests
cd backend
dotnet test

# View test results with detail
dotnet test --verbosity normal
```

**Tests cover:**
- Register with valid data → returns 201
- Register with duplicate email → returns 409 Conflict
- Login with correct credentials → returns 200 with token
- Login with wrong password → returns 401 Unauthorized
- Login with non-existent user → returns 401 Unauthorized

---

## API Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login and get JWT token |
| GET | `/api/auth/me` | Yes (JWT) | Get current user details |

### Example: Register
```json
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Password1!"
}
```

**Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }
}
```

### Example: Login
```json
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password1!"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }
}
```

### Example: Get User Details
```
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com"
}
```

---

## How Authentication Works

1. User registers → Password is BCrypt hashed → Stored in PostgreSQL
2. User logs in → BCrypt verifies password → Server issues JWT token
3. Frontend stores JWT in localStorage
4. Every API request includes `Authorization: Bearer <token>` header
5. Backend validates JWT signature and expiry on protected endpoints
6. If token is missing or invalid → 401 Unauthorized returned

---

## Security Implementations

| Feature | Implementation |
|---------|---------------|
| Password hashing | BCrypt with automatic salting |
| Authentication | JWT Bearer tokens (8 hour expiry) |
| Authorization | ASP.NET Core `[Authorize]` attribute |
| Email uniqueness | Database-level unique index |
| User enumeration protection | Same error for wrong email AND wrong password |
| Input validation | Data annotations on all DTOs |
| Password strength | Frontend enforces uppercase, number, special character |
| CORS | Restricted to known frontend origins only |

---

## API Testing with Postman
Included a  /docs folder with screenshots
```

---

## What I Would Add With More Time

### 1. AWS Microservice Architecture with LocalStack

The assessment mentions LocalStack as a bonus. Given more time, I would implement a microservice architecture using LocalStack to simulate AWS services locally.

**The architecture would look like this:**

```
┌─────────────┐     ┌─────────────┐     ┌──────────────────────┐
│   React     │────▶│  C# API     │────▶│      LocalStack      │
│  Frontend   │     │  (Auth)     │     │                      │
└─────────────┘     └─────────────┘     │  ┌────────────────┐  │
                                        │  │      SQS       │  │
                                        │  │  Message Queue │  │
                                        │  │ "user.registered" │
                                        │  └────────────────┘  │
                                        │                      │
                                        │  ┌────────────────┐  │
                                        │  │      SES       │  │
                                        │  │  Email Service │  │
                                        │  │ Welcome emails │  │
                                        │  └────────────────┘  │
                                        │                      │
                                        │  ┌────────────────┐  │
                                        │  │       S3       │  │
                                        │  │ File Storage   │  │
                                        │  │ Profile photos │  │
                                        │  └────────────────┘  │
                                        └──────────────────────┘
                                                  ▲
                                        ┌─────────┴──────────┐
                                        │  Notification      │
                                        │  Microservice      │
                                        │  (separate C# app) │
                                        │  Reads from SQS    │
                                        │  Sends via SES     │
                                        └────────────────────┘
```

**How it would work:**

When a user registers:
1. The Auth API saves the user to PostgreSQL (existing)
2. The Auth API publishes a `user.registered` event to an **SQS queue**
3. A separate **Notification microservice** (second C# app) listens to the queue
4. The Notification microservice sends a welcome email via **SES**
5. Profile photo uploads would be stored in **S3**

**Why this is good microservice architecture:**
- The Auth API and Notification service are completely independent
- If the email service goes down, registration still works
- Each service can be scaled, deployed, and updated separately
- This is exactly how companies like Netflix and Uber structure their systems

**Implementation would require:**
```bash
# Add LocalStack to docker-compose.yml
# Install AWSSDK.SQS and AWSSDK.SES NuGet packages
# Create a NotificationService that publishes to SQS
# Create a separate Worker microservice that reads from SQS
# Configure LocalStack endpoint in appsettings.json
```

---

### 2. JWT Refresh Token System

Currently the JWT access token lasts 8 hours. A production system would use:
- **Access token**: 15 minutes (short-lived, used for API calls)
- **Refresh token**: 7 days (long-lived, used only to get new access tokens)

When the access token expires, the frontend silently requests a new one using the refresh token — the user never gets logged out mid-session. The refresh token is stored in the database and rotated on every use (each use generates a new one, invalidating the old one).

---

### 3. Rate Limiting

Add ASP.NET Core's built-in rate limiting middleware to prevent brute force attacks on the login endpoint — for example, maximum 5 failed login attempts per IP address per minute before a temporary lockout.

---

### 4. Email Verification

After registration, send a verification email with a unique token. Users cannot log in until they click the verification link. This would use the LocalStack SES service described above.

---

## Project Structure

```
auth-assessment/
├── backend/
│   ├── AuthApi/
│   │   ├── Controllers/    # HTTP endpoints
│   │   ├── Data/           # DbContext (database gateway)
│   │   ├── DTOs/           # Request/Response shapes
│   │   ├── Migrations/     # Database schema history
│   │   ├── Models/         # Database entities
│   │   ├── Services/       # Business logic (JWT generation)
│   │   ├── Program.cs      # App bootstrap and middleware
│   │   └── Dockerfile
│   └── AuthApi.Tests/      # Unit tests
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios instance with interceptors
│   │   ├── components/     # Reusable components (Navbar, Loader)
│   │   ├── context/        # Auth state management
│   │   └── pages/          # Register, Login, Dashboard
│   └── Dockerfile
├── docker-compose.yml
├── build.sh
└── README.md
```