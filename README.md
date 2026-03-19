# Auth Assessment — Full-Stack Authentication App

A full-stack authentication application built with React, C# ASP.NET Core, PostgreSQL, and Docker.

## Architecture
```
React (Port 3000) → C# API (Port 5000) → PostgreSQL (Port 5432)
```

All services run in Docker containers orchestrated by Docker Compose.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite, React Router, Axios |
| Backend | C# ASP.NET Core 8, EF Core, JWT Auth |
| Database | PostgreSQL 16 |
| DevOps | Docker, Docker Compose |

## Prerequisites

- [Docker Desktop](https://docs.docker.com/get-started/get-docker/)
- [.NET 8 SDK](https://dotnet.microsoft.com/download) (for local dev/tests only)
- [Node.js 20+](https://nodejs.org) (for local frontend dev only)

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

## Running Tests
```bash
# Backend unit tests
cd backend
dotnet test

# View test results with detail
dotnet test --verbosity normal
```

## API Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login and get JWT token |
| GET | `/api/auth/me` | Yes (JWT) | Get current user details |

### Example: Register
```json
POST /api/auth/register
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Example: Login
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

## How Authentication Works

1. User registers → Password is BCrypt hashed → Stored in PostgreSQL
2. User logs in → BCrypt verifies password → Server issues JWT token
3. Frontend stores JWT in localStorage
4. Every API request includes `Authorization: Bearer <token>` header
5. Backend validates JWT signature and expiry on protected endpoints

## Stopping the App
```bash
docker compose down        # Stop containers (data preserved)
docker compose down -v     # Stop and delete database (fresh start)
```