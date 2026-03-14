# Partner Portal Backend

Go backend service for the Partner Portal application.

## Prerequisites

- Go 1.22+
- ArangoDB running locally or remotely

## Setup

1. Install dependencies:
```bash
go mod tidy
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your ArangoDB credentials

## Running

Development:
```bash
go run cmd/api/main.go
```

Build:
```bash
go build -o bin/api cmd/api/main.go
```

Run binary:
```bash
./bin/api
```

## API Endpoints

### Public
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/partners/register` - Register new partner

### Protected (requires JWT token)
- `GET /api/partners` - List all partners
- `GET /api/partners/{id}` - Get partner by ID

## Authentication

Include JWT token in Authorization header:
```
Authorization: Bearer <your-token>
```

To get a token, login with:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

## Project Structure

```
back-end/
├── cmd/
│   └── api/
│       └── main.go           # Application entry point
├── internal/
│   ├── database/
│   │   └── arango.go         # ArangoDB client
│   ├── handlers/
│   │   ├── auth.go           # Authentication handlers
│   │   └── partner.go        # Partner CRUD handlers
│   ├── middleware/
│   │   ├── auth.go           # JWT authentication middleware
│   │   └── cors.go           # CORS middleware
│   └── models/
│       └── partner.go        # Data models
├── .env.example
├── go.mod
└── README.md
```
