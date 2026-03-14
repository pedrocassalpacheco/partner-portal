# Swagger API Documentation

Swagger/OpenAPI documentation has been successfully integrated into the Partner Portal API.

## Accessing Swagger UI

Once the backend server is running, you can access the interactive API documentation at:

```
http://localhost:8081/swagger/index.html
```

## Features

The Swagger UI provides:
- **Interactive API Testing**: Try out API endpoints directly from your browser
- **Complete Documentation**: View all available endpoints, parameters, request/response schemas
- **Authentication Support**: Test protected endpoints using Bearer JWT tokens
- **Response Examples**: See sample request/response payloads

## Using Swagger UI

### 1. Start the Backend Server
```bash
cd back-end
go run ./cmd/api
# or
./bin/api
```

### 2. Open Swagger UI
Navigate to: http://localhost:8081/swagger/index.html

### 3. Authenticate (for protected endpoints)
1. Click the **"Authorize"** button at the top right
2. Enter your JWT token in the format: `Bearer <your-token>`
3. Click "Authorize" and then "Close"
4. All subsequent requests will include the authentication token

### 4. Test Endpoints
1. Expand any endpoint (e.g., GET /api/accounts)
2. Click "Try it out"
3. Fill in any required parameters
4. Click "Execute"
5. View the response below

## API Endpoints Summary

### Authentication
- `POST /api/auth/login` - User login (returns JWT token)

### Partners
- `POST /api/partners/register` - Register new partner (public)
- `GET /api/partners` - List all partners (authenticated)
- `GET /api/partners/{id}` - Get partner by ID (authenticated)
- `PUT /api/partners/{id}` - Update partner (authenticated)
- `DELETE /api/partners/{id}` - Delete partner (authenticated)

### Accounts
- `POST /api/accounts` - Create new account (authenticated, approved partners only)
- `GET /api/accounts` - List all accounts (authenticated)
- `GET /api/accounts/{id}` - Get account by ID (authenticated)
- `PUT /api/accounts/{id}` - Update account (authenticated)
- `DELETE /api/accounts/{id}` - Delete account (authenticated)
- `POST /api/accounts/{id}/change-password` - Change password (authenticated)

### Opportunities
- `POST /api/opportunities` - Create new opportunity (authenticated)
- `GET /api/opportunities` - List all opportunities (authenticated)
- `GET /api/opportunities/{id}` - Get opportunity by ID (authenticated)
- `PUT /api/opportunities/{id}` - Update opportunity (authenticated)
- `DELETE /api/opportunities/{id}` - Delete opportunity (authenticated)
- `GET /api/partners/{id}/opportunities` - Get opportunities by partner (authenticated)

### Products
- `GET /api/products` - List all products (authenticated)
- `GET /api/products/{id}` - Get product by ID (authenticated)
- `POST /api/products` - Create new product (authenticated)
- `PUT /api/products/{id}` - Update product (authenticated)
- `DELETE /api/products/{id}` - Delete product (authenticated)

### Health
- `GET /api/health` - Health check (public)

## Regenerating Documentation

If you modify the API handlers or add new endpoints:

```bash
cd back-end
~/go/bin/swag init -g cmd/api/main.go -o docs
go build -o bin/api ./cmd/api
```

## API Documentation Files

The following files are generated in `back-end/docs/`:
- `docs.go` - Go code for embedding docs
- `swagger.json` - OpenAPI specification in JSON format
- `swagger.yaml` - OpenAPI specification in YAML format

## Notes

- Swagger UI is available at `/swagger/` route (includes trailing slash)
- The Swagger spec is served at `/swagger/doc.json`
- All protected endpoints require a valid JWT token obtained from the login endpoint
- The API base path is `/api`
