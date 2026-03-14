package main

import (
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/pedrocassalpacheco/partner-portal/back-end/internal/database"
	"github.com/pedrocassalpacheco/partner-portal/back-end/internal/handlers"
	"github.com/pedrocassalpacheco/partner-portal/back-end/internal/middleware"

	_ "github.com/pedrocassalpacheco/partner-portal/back-end/docs" // Import generated docs
	httpSwagger "github.com/swaggo/http-swagger"
)

// @title Partner Portal API
// @version 1.0
// @description API for managing partners, opportunities, products, and accounts in the Partner Portal
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.email support@partnerportal.com

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:8081
// @BasePath /api

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.

func main() {
	// Load .env file from root directory
	if err := godotenv.Load("../.env"); err != nil {
		// Try current directory as fallback
		if err := godotenv.Load(); err != nil {
			log.Println("No .env file found, using environment variables")
		}
	}
	// Initialize ArangoDB connection
	db, err := database.NewArangoClient(
		os.Getenv("ARANGO_URL"),
		os.Getenv("ARANGO_DATABASE"),
		os.Getenv("ARANGO_USERNAME"),
		os.Getenv("ARANGO_PASSWORD"),
	)
	if err != nil {
		log.Fatalf("Failed to connect to ArangoDB: %v", err)
	}
	defer db.Close()

	// Initialize handlers
	partnerHandler := handlers.NewPartnerHandler(db)
	opportunityHandler := handlers.NewOpportunityHandler(db)
	productHandler := handlers.NewProductHandler(db)
	accountHandler := handlers.NewAccountHandler(db)
	authHandler := handlers.NewAuthHandler(db, accountHandler)
	healthHandler := handlers.NewHealthHandler(db)

	// Setup routes
	mux := http.NewServeMux()

	// Health check - simple route without method prefix
	mux.HandleFunc("/api/health", healthHandler.Health)

	// Public routes
	mux.HandleFunc("POST /api/auth/login", authHandler.Login)
	mux.HandleFunc("POST /api/partners/register", partnerHandler.Register)
	mux.HandleFunc("POST /api/echo", handlers.Echo)

	// Legacy login route (deprecated, but kept for backward compatibility)
	mux.HandleFunc("POST /api/login", handlers.Login)

	// Protected routes (require JWT token) - wrapped with Auth middleware
	mux.Handle("GET /api/partners", middleware.Auth(http.HandlerFunc(partnerHandler.List)))
	mux.Handle("GET /api/partners/{id}", middleware.Auth(http.HandlerFunc(partnerHandler.GetByID)))
	mux.Handle("PUT /api/partners/{id}", middleware.Auth(http.HandlerFunc(partnerHandler.Update)))

	// Account routes (protected)
	mux.Handle("POST /api/accounts", middleware.Auth(http.HandlerFunc(accountHandler.Create)))
	mux.Handle("GET /api/accounts", middleware.Auth(http.HandlerFunc(accountHandler.List)))
	mux.Handle("GET /api/accounts/{id}", middleware.Auth(http.HandlerFunc(accountHandler.GetByID)))
	mux.Handle("PUT /api/accounts/{id}", middleware.Auth(http.HandlerFunc(accountHandler.Update)))
	mux.Handle("DELETE /api/accounts/{id}", middleware.Auth(http.HandlerFunc(accountHandler.Delete)))
	mux.Handle("POST /api/accounts/{id}/change-password", middleware.Auth(http.HandlerFunc(accountHandler.ChangePassword)))

	// Opportunity routes (protected)
	mux.Handle("POST /api/opportunities", middleware.Auth(http.HandlerFunc(opportunityHandler.Create)))
	mux.Handle("GET /api/opportunities", middleware.Auth(http.HandlerFunc(opportunityHandler.List)))
	mux.Handle("GET /api/opportunities/{id}", middleware.Auth(http.HandlerFunc(opportunityHandler.GetByID)))
	mux.Handle("PUT /api/opportunities/{id}", middleware.Auth(http.HandlerFunc(opportunityHandler.Update)))
	mux.Handle("DELETE /api/opportunities/{id}", middleware.Auth(http.HandlerFunc(opportunityHandler.Delete)))
	mux.Handle("GET /api/partners/{id}/opportunities", middleware.Auth(http.HandlerFunc(opportunityHandler.GetByPartnerID)))
	mux.Handle("DELETE /api/partners/{id}", middleware.Auth(http.HandlerFunc(partnerHandler.Delete)))

	// Product routes (protected)
	mux.Handle("GET /api/products", middleware.Auth(http.HandlerFunc(productHandler.List)))
	mux.Handle("GET /api/products/{id}", middleware.Auth(http.HandlerFunc(productHandler.GetByID)))
	mux.Handle("POST /api/products", middleware.Auth(http.HandlerFunc(productHandler.Create)))
	mux.Handle("PUT /api/products/{id}", middleware.Auth(http.HandlerFunc(productHandler.Update)))
	mux.Handle("DELETE /api/products/{id}", middleware.Auth(http.HandlerFunc(productHandler.Delete)))

	// Swagger documentation
	mux.HandleFunc("/swagger/", httpSwagger.Handler(
		httpSwagger.URL("http://localhost:8081/swagger/doc.json"),
	))

	// Wrap with CORS middleware
	handler := middleware.CORS(mux)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
