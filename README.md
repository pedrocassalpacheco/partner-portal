# Partner Portal

Full-stack partner registration portal built with React, Go, and ArangoDB.

## Architecture

- **Frontend**: React 19 + Vite (port 80 in Docker, 5173 in dev)
- **Backend**: Go 1.22 REST API (port 8080)
- **Database**: ArangoDB (port 8529)

## Quick Start with Docker

1. **Copy environment file:**
```bash
cp .env.docker .env
# Edit .env with your passwords
```

2. **Start all services:**
```bash
docker-compose up -d
```

3. **Access the application:**
- Frontend: http://localhost
- Backend API: http://localhost:8080
- ArangoDB UI: http://localhost:8529

4. **Stop services:**
```bash
docker-compose down
```

5. **View logs:**
```bash
docker-compose logs -f
```

## Local Development

### Frontend
```bash
cd front-end
npm install
npm run dev
```
Access at http://localhost:5173

### Backend
```bash
cd back-end
cp .env.example .env
# Edit .env with your ArangoDB credentials
go mod download
go run cmd/api/main.go
```
API runs on http://localhost:8080

## Project Structure

```
partner-portal/
├── front-end/              # React application
│   ├── src/
│   │   ├── PartnerRegistration.jsx
│   │   ├── arango.css
│   │   └── form-styles.css
│   ├── Dockerfile
│   └── package.json
├── back-end/               # Go API
│   ├── cmd/api/           # Entry point
│   ├── internal/
│   │   ├── handlers/      # HTTP handlers
│   │   ├── models/        # Data models
│   │   ├── database/      # ArangoDB client
│   │   └── middleware/    # JWT auth, CORS
│   ├── Dockerfile
│   └── go.mod
└── docker-compose.yml      # Orchestration
```

## API Endpoints

### Public
- `POST /api/auth/login` - Get JWT token
- `POST /api/partners/register` - Register new partner

### Protected (requires JWT)
- `GET /api/partners` - List all partners
- `GET /api/partners/{id}` - Get partner by ID

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 8080)
- `JWT_SECRET` - Secret for signing JWT tokens
- `ARANGO_URL` - ArangoDB connection URL
- `ARANGO_DATABASE` - Database name
- `ARANGO_USERNAME` - Database username
- `ARANGO_PASSWORD` - Database password

## Docker Commands

**Build and start:**
```bash
docker-compose up --build
```

**Rebuild specific service:**
```bash
docker-compose build frontend
docker-compose up -d frontend
```

**Remove volumes (clean slate):**
```bash
docker-compose down -v
```

## VS Code Debugging

Press F5 and select:
- "Launch Chrome against localhost" - Debug frontend
- "Launch Go Backend" - Debug backend with breakpoints

## License

MIT
