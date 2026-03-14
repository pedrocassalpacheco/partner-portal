# Environment Configuration Guide

## How Services Find Each Other

### 1. Frontend → Backend (API URL)

The frontend needs to know where the backend API is hosted.

#### Local Development
```bash
# In front-end/.env.local
VITE_API_URL=http://localhost:8081/api
```

#### Cloud Run Deployment
After deploying backend, you get a URL like:
```
https://partner-portal-backend-xxxxx-uc.a.run.app
```

Deploy frontend with this URL:
```bash
gcloud run deploy partner-portal-frontend \
  --set-env-vars "VITE_API_URL=https://partner-portal-backend-xxxxx-uc.a.run.app/api"
```

The frontend now knows where the backend is!

---

### 2. Backend → Database (Database URL)

The backend needs database connection details.

#### Local Development (Docker Compose)
```bash
# Backend automatically uses these from docker-compose.yml
ARANGO_URL=http://arangodb:8529
ARANGO_DATABASE=partner_portal
ARANGO_USERNAME=root
ARANGO_PASSWORD=rootpassword
```

#### Cloud Run Deployment
Set environment variables when deploying:
```bash
gcloud run deploy partner-portal-backend \
  --set-env-vars "\
    ARANGO_URL=https://your-instance.arangodb.cloud:8529,\
    ARANGO_DATABASE=partner_portal,\
    ARANGO_USERNAME=root,\
    ARANGO_PASSWORD=your-secure-password,\
    JWT_SECRET=your-jwt-secret"
```

The backend reads these from `os.Getenv()` in Go!

---

## Configuration Flow

### Frontend Configuration

```
Build Time (Dockerfile)           Runtime (Container Start)
     │                                     │
     ├─ Reads VITE_API_URL                │
     │  (if provided as build arg)        │
     │                                     │
     └─────────────────────────────────►  ├─ docker-entrypoint.sh runs
                                           ├─ Creates env-config.js with VITE_API_URL
                                           ├─ Injects into window.ENV
                                           │
                                           └─ React app reads config.apiUrl
```

### Backend Configuration

```
Container Start
     │
     ├─ Cloud Run injects environment variables
     │  - ARANGO_URL
     │  - ARANGO_DATABASE
     │  - ARANGO_USERNAME
     │  - ARANGO_PASSWORD
     │  - JWT_SECRET
     │
     └─ Go app reads via os.Getenv()
        (see back-end/internal/database/arango.go)
```

---

## Complete Deployment Workflow

### Step 1: Deploy Backend
```bash
gcloud run deploy partner-portal-backend \
  --source ./back-end \
  --region us-central1 \
  --set-env-vars "\
    ARANGO_URL=https://your-db.arangodb.cloud:8529,\
    ARANGO_DATABASE=partner_portal,\
    ARANGO_USERNAME=root,\
    ARANGO_PASSWORD=secure123,\
    JWT_SECRET=jwt-secret-key"
```

**Output:** `https://partner-portal-backend-abc123-uc.a.run.app`

### Step 2: Deploy Frontend (with backend URL)
```bash
gcloud run deploy partner-portal-frontend \
  --source ./front-end \
  --region us-central1 \
  --set-env-vars "VITE_API_URL=https://partner-portal-backend-abc123-uc.a.run.app/api"
```

**Output:** `https://partner-portal-frontend-xyz789-uc.a.run.app`

### Step 3: Update Backend CORS
Update backend to allow frontend domain:
```bash
gcloud run services update partner-portal-backend \
  --region us-central1 \
  --update-env-vars "ALLOWED_ORIGINS=https://partner-portal-frontend-xyz789-uc.a.run.app"
```

---

## Environment Variables Reference

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API endpoint | `https://backend-xxx.run.app/api` |
| `VITE_ENVIRONMENT` | Environment name | `production` |

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `8080` |
| `JWT_SECRET` | JWT signing key | `your-256-bit-secret` |
| `ARANGO_URL` | ArangoDB endpoint | `https://db.arangodb.cloud:8529` |
| `ARANGO_DATABASE` | Database name | `partner_portal` |
| `ARANGO_USERNAME` | Database user | `root` |
| `ARANGO_PASSWORD` | Database password | `secure-password` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `https://frontend-xxx.run.app` |

---

## Local Development

### Option 1: Docker Compose (Recommended)
```bash
# Everything configured automatically
docker-compose up
```

Frontend: http://localhost:8080
Backend: http://localhost:8081
Database: http://localhost:8529

### Option 2: Manual Setup
```bash
# Terminal 1: Start ArangoDB
docker run -p 8529:8529 -e ARANGO_ROOT_PASSWORD=test arangodb:latest

# Terminal 2: Start Backend
cd back-end
export ARANGO_URL=http://localhost:8529
export ARANGO_PASSWORD=test
go run ./cmd/api

# Terminal 3: Start Frontend
cd front-end
echo "VITE_API_URL=http://localhost:8081/api" > .env.local
npm run dev
```

---

## Using Environment Variables in Code

### Frontend (React)
```javascript
// src/config/env.js
import { config } from '../config/env'

// Use anywhere in your app
const apiUrl = config.apiUrl  // Gets URL from environment
```

### Backend (Go)
```go
// internal/database/arango.go
import "os"

url := os.Getenv("ARANGO_URL")
database := os.Getenv("ARANGO_DATABASE")
username := os.Getenv("ARANGO_USERNAME")
password := os.Getenv("ARANGO_PASSWORD")
```

---

## Troubleshooting

### Frontend can't reach backend
1. Check VITE_API_URL is set correctly
2. Check browser console for CORS errors
3. Verify backend ALLOWED_ORIGINS includes frontend URL

### Backend can't reach database
1. Check ARANGO_URL is accessible from Cloud Run
2. Verify database allows connections from Cloud Run IP ranges
3. Test connection: `curl -u root:password $ARANGO_URL/_api/version`

### Environment variables not working
1. View current variables: `gcloud run services describe SERVICE_NAME --format="yaml(spec.template.spec.containers[].env)"`
2. Update variables: `gcloud run services update SERVICE_NAME --update-env-vars KEY=VALUE`
3. Check logs: `gcloud run services logs read SERVICE_NAME --limit 50`

---

## Security Best Practices

1. **Never commit secrets** - Use `.env.local` (gitignored)
2. **Use Secret Manager** - For production secrets
   ```bash
   gcloud run deploy SERVICE \
     --set-secrets "JWT_SECRET=jwt-secret:latest"
   ```
3. **Rotate credentials** regularly
4. **Use VPC** for internal service communication
5. **Enable IAM authentication** between services

---

## CI/CD with GitHub Actions

```yaml
# .github/workflows/deploy.yml
env:
  BACKEND_URL: ${{ secrets.BACKEND_URL }}
  ARANGO_URL: ${{ secrets.ARANGO_URL }}
  ARANGO_PASSWORD: ${{ secrets.ARANGO_PASSWORD }}

steps:
  - name: Deploy Backend
    run: |
      gcloud run deploy partner-portal-backend \
        --set-env-vars "ARANGO_URL=$ARANGO_URL,ARANGO_PASSWORD=$ARANGO_PASSWORD"
  
  - name: Deploy Frontend
    run: |
      gcloud run deploy partner-portal-frontend \
        --set-env-vars "VITE_API_URL=$BACKEND_URL/api"
```

Store secrets in GitHub repository settings.
