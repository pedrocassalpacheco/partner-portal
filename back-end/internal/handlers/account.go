package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/pedrocassalpacheco/partner-portal/back-end/internal/database"
	"github.com/pedrocassalpacheco/partner-portal/back-end/internal/models"
	"golang.org/x/crypto/bcrypt"
)

type AccountHandler struct {
	db *database.ArangoClient
}

func NewAccountHandler(db *database.ArangoClient) *AccountHandler {
	return &AccountHandler{db: db}
}

// HashPassword generates a bcrypt hash of the password
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// CheckPasswordHash compares a password with its hash
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// Create godoc
// @Summary Create new account
// @Description Create a new partner account (partner must be approved)
// @Tags accounts
// @Accept json
// @Produce json
// @Param account body models.AccountCreateRequest true "Account data"
// @Success 201 {object} models.Account
// @Failure 400 {string} string "Invalid request body"
// @Failure 403 {string} string "Partner not approved"
// @Failure 409 {string} string "Username already exists"
// @Failure 500 {string} string "Internal server error"
// @Security BearerAuth
// @Router /accounts [post]
func (h *AccountHandler) Create(w http.ResponseWriter, r *http.Request) {
	log.Printf("[POST] /api/accounts - Create account request")
	var req models.AccountCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("[POST] /api/accounts - Invalid request body: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	ctx := context.Background()

	// Check if partner exists and is approved
	var partner models.Partner
	_, err := h.db.GetPartnersCollection().ReadDocument(ctx, req.PartnerID, &partner)
	if err != nil {
		log.Printf("[POST] /api/accounts - Partner not found: %v", err)
		http.Error(w, "Partner not found", http.StatusNotFound)
		return
	}

	if partner.RegistrationStatus != "approved" {
		log.Printf("[POST] /api/accounts - Partner not approved: %s (status: %s)", req.PartnerID, partner.RegistrationStatus)
		http.Error(w, "Only approved partners can create accounts", http.StatusForbidden)
		return
	}

	// Check if username already exists
	query := `FOR a IN accounts FILTER a.username == @username RETURN a`
	cursor, err := h.db.GetDatabase().Query(ctx, query, map[string]interface{}{
		"username": req.Username,
	})
	if err != nil {
		log.Printf("[POST] /api/accounts - Failed to check username: %v", err)
		http.Error(w, "Failed to check username", http.StatusInternalServerError)
		return
	}
	defer cursor.Close()

	if cursor.HasMore() {
		log.Printf("[POST] /api/accounts - Username already exists: %s", req.Username)
		http.Error(w, "Username already exists", http.StatusConflict)
		return
	}

	// Hash password
	passwordHash, err := HashPassword(req.Password)
	if err != nil {
		log.Printf("[POST] /api/accounts - Failed to hash password: %v", err)
		http.Error(w, "Failed to create account", http.StatusInternalServerError)
		return
	}

	// Create account
	account := models.Account{
		PartnerID:    req.PartnerID,
		Username:     req.Username,
		PasswordHash: passwordHash,
		Email:        req.Email,
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		Role:         req.Role,
		IsActive:     true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	meta, err := h.db.GetAccountsCollection().CreateDocument(ctx, account)
	if err != nil {
		log.Printf("[POST] /api/accounts - Failed to create account: %v", err)
		http.Error(w, "Failed to create account", http.StatusInternalServerError)
		return
	}

	account.ID = meta.Key
	account.PasswordHash = "" // Don't return password hash

	log.Printf("[POST] /api/accounts - Successfully created account: %s (ID: %s) for partner: %s", account.Username, meta.Key, account.PartnerID)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(account)
}

// List godoc
// @Summary List all accounts
// @Description Get paginated list of all accounts with optional filters
// @Tags accounts
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(25)
// @Param username query string false "Filter by username"
// @Param email query string false "Filter by email"
// @Param role query string false "Filter by role"
// @Param isActive query boolean false "Filter by active status"
// @Success 200 {object} map[string]interface{} "Paginated accounts"
// @Failure 500 {string} string "Internal server error"
// @Security BearerAuth
// @Router /accounts [get]
func (h *AccountHandler) List(w http.ResponseWriter, r *http.Request) {
	log.Printf("[GET] /api/accounts - List request with query: %s", r.URL.RawQuery)
	ctx := context.Background()

	// Parse query parameters
	page := 1
	limit := 25
	username := r.URL.Query().Get("username")
	email := r.URL.Query().Get("email")
	role := r.URL.Query().Get("role")
	isActiveStr := r.URL.Query().Get("isActive")

	if pageStr := r.URL.Query().Get("page"); pageStr != "" {
		fmt.Sscanf(pageStr, "%d", &page)
		if page < 1 {
			page = 1
		}
	}

	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		fmt.Sscanf(limitStr, "%d", &limit)
		if limit < 1 || limit > 100 {
			limit = 25
		}
	}

	// Build filter conditions
	filterConditions := []string{}
	bindVars := map[string]interface{}{}

	if username != "" {
		filterConditions = append(filterConditions, "LOWER(a.username) LIKE @username")
		bindVars["username"] = "%" + strings.ToLower(username) + "%"
	}

	if email != "" {
		filterConditions = append(filterConditions, "LOWER(a.email) LIKE @email")
		bindVars["email"] = "%" + strings.ToLower(email) + "%"
	}

	if role != "" {
		filterConditions = append(filterConditions, "a.role == @role")
		bindVars["role"] = role
	}

	if isActiveStr != "" {
		isActive := isActiveStr == "true"
		filterConditions = append(filterConditions, "a.isActive == @isActive")
		bindVars["isActive"] = isActive
	}

	// Build query
	filterClause := ""
	if len(filterConditions) > 0 {
		filterClause = "FILTER " + strings.Join(filterConditions, " AND ")
	}

	// Count total
	countQuery := fmt.Sprintf("FOR a IN accounts %s COLLECT WITH COUNT INTO total RETURN total", filterClause)
	countCursor, err := h.db.GetDatabase().Query(ctx, countQuery, bindVars)
	if err != nil {
		log.Printf("[GET] /api/accounts - Failed to count accounts: %v", err)
		http.Error(w, "Failed to count accounts", http.StatusInternalServerError)
		return
	}
	defer countCursor.Close()

	var total int64
	if countCursor.HasMore() {
		countCursor.ReadDocument(ctx, &total)
	}

	// Get paginated results
	offset := (page - 1) * limit
	query := fmt.Sprintf("FOR a IN accounts %s SORT a.createdAt DESC LIMIT %d, %d RETURN a", filterClause, offset, limit)

	cursor, err := h.db.GetDatabase().Query(ctx, query, bindVars)
	if err != nil {
		log.Printf("[GET] /api/accounts - Failed to query accounts: %v", err)
		http.Error(w, "Failed to query accounts", http.StatusInternalServerError)
		return
	}
	defer cursor.Close()

	var accounts []models.Account
	for cursor.HasMore() {
		var account models.Account
		_, err := cursor.ReadDocument(ctx, &account)
		if err != nil {
			log.Printf("[GET] /api/accounts - Failed to read account: %v", err)
			continue
		}
		account.PasswordHash = "" // Don't return password hash
		accounts = append(accounts, account)
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))

	response := map[string]interface{}{
		"data":       accounts,
		"total":      total,
		"page":       page,
		"limit":      limit,
		"totalPages": totalPages,
	}

	log.Printf("[GET] /api/accounts - Successfully returned %d accounts (page %d/%d, total: %d)", len(accounts), page, totalPages, total)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetByID godoc
// @Summary Get account by ID
// @Description Get a single account by its ID
// @Tags accounts
// @Accept json
// @Produce json
// @Param id path string true "Account ID"
// @Success 200 {object} models.Account
// @Failure 404 {string} string "Account not found"
// @Security BearerAuth
// @Router /accounts/{id} [get]
func (h *AccountHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	log.Printf("[GET] /api/accounts/{id} - Get account: %s", id)

	ctx := context.Background()
	var account models.Account
	_, err := h.db.GetAccountsCollection().ReadDocument(ctx, id, &account)
	if err != nil {
		log.Printf("[GET] /api/accounts/{id} - Account not found: %v", err)
		http.Error(w, "Account not found", http.StatusNotFound)
		return
	}

	account.PasswordHash = "" // Don't return password hash

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(account)
}

// GetByUsername returns an account by username (used for authentication)
func (h *AccountHandler) GetByUsername(username string) (*models.Account, error) {
	ctx := context.Background()
	query := `FOR a IN accounts FILTER a.username == @username RETURN a`
	cursor, err := h.db.GetDatabase().Query(ctx, query, map[string]interface{}{
		"username": username,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to query account: %w", err)
	}
	defer cursor.Close()

	if !cursor.HasMore() {
		return nil, fmt.Errorf("account not found")
	}

	var account models.Account
	_, err = cursor.ReadDocument(ctx, &account)
	if err != nil {
		return nil, fmt.Errorf("failed to read account: %w", err)
	}

	return &account, nil
}

// Update godoc
// @Summary Update account
// @Description Update account details (excluding password)
// @Tags accounts
// @Accept json
// @Produce json
// @Param id path string true "Account ID"
// @Param account body models.AccountUpdateRequest true "Account update data"
// @Success 200 {object} models.Account
// @Failure 400 {string} string "Invalid request body"
// @Failure 404 {string} string "Account not found"
// @Failure 500 {string} string "Internal server error"
// @Security BearerAuth
// @Router /accounts/{id} [put]
func (h *AccountHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	log.Printf("[PUT] /api/accounts/{id} - Update account: %s", id)

	var req models.AccountUpdateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("[PUT] /api/accounts/{id} - Invalid request body: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	ctx := context.Background()

	// Get existing account
	var account models.Account
	_, err := h.db.GetAccountsCollection().ReadDocument(ctx, id, &account)
	if err != nil {
		log.Printf("[PUT] /api/accounts/{id} - Account not found: %v", err)
		http.Error(w, "Account not found", http.StatusNotFound)
		return
	}

	// Update fields
	if req.Email != "" {
		account.Email = req.Email
	}
	if req.FirstName != "" {
		account.FirstName = req.FirstName
	}
	if req.LastName != "" {
		account.LastName = req.LastName
	}
	if req.IsActive != nil {
		account.IsActive = *req.IsActive
	}
	account.UpdatedAt = time.Now()

	_, err = h.db.GetAccountsCollection().UpdateDocument(ctx, id, account)
	if err != nil {
		log.Printf("[PUT] /api/accounts/{id} - Failed to update account: %v", err)
		http.Error(w, "Failed to update account", http.StatusInternalServerError)
		return
	}

	account.PasswordHash = "" // Don't return password hash

	log.Printf("[PUT] /api/accounts/{id} - Successfully updated account: %s", id)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(account)
}

// ChangePassword godoc
// @Summary Change account password
// @Description Change password for an account
// @Tags accounts
// @Accept json
// @Produce json
// @Param id path string true "Account ID"
// @Param password body models.ChangePasswordRequest true "Password change data"
// @Success 200 {object} map[string]string
// @Failure 400 {string} string "Invalid request body"
// @Failure 401 {string} string "Current password incorrect"
// @Failure 404 {string} string "Account not found"
// @Failure 500 {string} string "Internal server error"
// @Security BearerAuth
// @Router /accounts/{id}/change-password [post]
func (h *AccountHandler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	log.Printf("[POST] /api/accounts/{id}/change-password - Change password request: %s", id)

	var req models.ChangePasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("[POST] /api/accounts/{id}/change-password - Invalid request body: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	ctx := context.Background()

	// Get existing account
	var account models.Account
	_, err := h.db.GetAccountsCollection().ReadDocument(ctx, id, &account)
	if err != nil {
		log.Printf("[POST] /api/accounts/{id}/change-password - Account not found: %v", err)
		http.Error(w, "Account not found", http.StatusNotFound)
		return
	}

	// Verify current password
	if !CheckPasswordHash(req.CurrentPassword, account.PasswordHash) {
		log.Printf("[POST] /api/accounts/{id}/change-password - Invalid current password")
		http.Error(w, "Invalid current password", http.StatusUnauthorized)
		return
	}

	// Hash new password
	newPasswordHash, err := HashPassword(req.NewPassword)
	if err != nil {
		log.Printf("[POST] /api/accounts/{id}/change-password - Failed to hash password: %v", err)
		http.Error(w, "Failed to change password", http.StatusInternalServerError)
		return
	}

	account.PasswordHash = newPasswordHash
	account.UpdatedAt = time.Now()

	_, err = h.db.GetAccountsCollection().UpdateDocument(ctx, id, account)
	if err != nil {
		log.Printf("[POST] /api/accounts/{id}/change-password - Failed to update password: %v", err)
		http.Error(w, "Failed to change password", http.StatusInternalServerError)
		return
	}

	log.Printf("[POST] /api/accounts/{id}/change-password - Successfully changed password for account: %s", id)
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message":"Password changed successfully"}`))
}

// Delete deletes an account
func (h *AccountHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	log.Printf("[DELETE] /api/accounts/{id} - Delete account: %s", id)

	ctx := context.Background()
	_, err := h.db.GetAccountsCollection().RemoveDocument(ctx, id)
	if err != nil {
		log.Printf("[DELETE] /api/accounts/{id} - Failed to delete account: %v", err)
		http.Error(w, "Failed to delete account", http.StatusInternalServerError)
		return
	}

	log.Printf("[DELETE] /api/accounts/{id} - Successfully deleted account: %s", id)
	w.WriteHeader(http.StatusNoContent)
}
