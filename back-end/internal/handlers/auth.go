package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/pedrocassalpacheco/partner-portal/back-end/internal/database"
)

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token     string `json:"token"`
	Username  string `json:"username"`
	Role      string `json:"role"`
	PartnerID string `json:"partnerId,omitempty"`
}

type AuthHandler struct {
	db             *database.ArangoClient
	accountHandler *AccountHandler
}

func NewAuthHandler(db *database.ArangoClient, accountHandler *AccountHandler) *AuthHandler {
	return &AuthHandler{
		db:             db,
		accountHandler: accountHandler,
	}
}

// Login godoc
// @Summary User login
// @Description Authenticate user with username and password, returns JWT token
// @Tags auth
// @Accept json
// @Produce json
// @Param credentials body LoginRequest true "Login credentials"
// @Success 200 {object} LoginResponse
// @Failure 400 {string} string "Invalid request body"
// @Failure 401 {string} string "Invalid credentials or account inactive"
// @Router /auth/login [post]
func (ah *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	log.Printf("[POST] /api/auth/login - Login attempt")
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("[POST] /api/auth/login - Invalid request body: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Get account by username
	account, err := ah.accountHandler.GetByUsername(req.Username)
	if err != nil {
		log.Printf("[POST] /api/auth/login - Account not found for user: %s", req.Username)
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// Check if account is active
	if !account.IsActive {
		log.Printf("[POST] /api/auth/login - Account inactive for user: %s", req.Username)
		http.Error(w, "Account is inactive", http.StatusUnauthorized)
		return
	}

	// Verify password
	if !CheckPasswordHash(req.Password, account.PasswordHash) {
		log.Printf("[POST] /api/auth/login - Invalid password for user: %s", req.Username)
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// Update last login time
	account.LastLoginAt = time.Now()
	ctx := r.Context()
	_, err = ah.db.GetAccountsCollection().UpdateDocument(ctx, account.ID, account)
	if err != nil {
		log.Printf("[POST] /api/auth/login - Failed to update last login: %v", err)
		// Don't fail the login for this
	}

	// Generate JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":       req.Username,
		"partnerId": account.PartnerID,
		"role":      account.Role,
		"exp":       time.Now().Add(24 * time.Hour).Unix(),
		"iat":       time.Now().Unix(),
	})

	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "your-secret-key-change-in-production"
	}

	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		log.Printf("[POST] /api/auth/login - Failed to generate token: %v", err)
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	log.Printf("[POST] /api/auth/login - Successfully authenticated user: %s (role: %s)", req.Username, account.Role)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(LoginResponse{
		Token:     tokenString,
		Username:  account.Username,
		Role:      account.Role,
		PartnerID: account.PartnerID,
	})
}

// Keep the old Login function for backward compatibility (will be deprecated)
func Login(w http.ResponseWriter, r *http.Request) {
	log.Printf("[POST] /api/login - Login attempt (legacy)")
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("[POST] /api/login - Invalid request body: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// TODO: Validate credentials against database
	// For now, using simple hardcoded check
	if req.Username != "admin" || req.Password != "admin123" {
		log.Printf("[POST] /api/login - Invalid credentials for user: %s", req.Username)
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// Generate JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": req.Username,
		"exp": time.Now().Add(24 * time.Hour).Unix(),
		"iat": time.Now().Unix(),
	})

	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "your-secret-key-change-in-production"
	}

	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		log.Printf("[POST] /api/login - Failed to generate token: %v", err)
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	log.Printf("[POST] /api/login - Successfully authenticated user: %s", req.Username)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(LoginResponse{Token: tokenString, Username: req.Username, Role: "admin"})
}
