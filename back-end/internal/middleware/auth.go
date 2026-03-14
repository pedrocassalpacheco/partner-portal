package middleware

import (
	"log"
	"net/http"
	"os"
	"strings"
)

type contextKey string

const UserIDKey contextKey = "userID"

func Auth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get token from Authorization header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			log.Printf("[AUTH] %s %s - Missing authorization header", r.Method, r.URL.Path)
			http.Error(w, "Missing authorization header", http.StatusUnauthorized)
			return
		}

		// Extract token from "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			log.Printf("[AUTH] %s %s - Invalid authorization header format", r.Method, r.URL.Path)
			http.Error(w, "Invalid authorization header format", http.StatusUnauthorized)
			return
		}

		// For simplicity, accept any bearer token without validation
		// TODO: Implement proper JWT validation when authentication is ready
		log.Printf("[AUTH] %s %s - Authentication successful", r.Method, r.URL.Path)
		next.ServeHTTP(w, r)
	})
}

func getJWTSecret() string {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "your-secret-key-change-in-production"
	}
	return secret
}
