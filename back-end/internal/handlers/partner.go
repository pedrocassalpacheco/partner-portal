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
)

type PartnerHandler struct {
	db *database.ArangoClient
}

func NewPartnerHandler(db *database.ArangoClient) *PartnerHandler {
	return &PartnerHandler{db: db}
}

// Register godoc
// @Summary Register new partner
// @Description Register a new partner (public endpoint, no authentication required)
// @Tags partners
// @Accept json
// @Produce json
// @Param partner body models.PartnerRegistrationRequest true "Partner registration data"
// @Success 201 {object} models.Partner
// @Failure 400 {string} string "Invalid request body"
// @Failure 500 {string} string "Internal server error"
// @Router /partners/register [post]
func (h *PartnerHandler) Register(w http.ResponseWriter, r *http.Request) {
	log.Printf("[POST] /api/register - Partner registration request")
	var req models.PartnerRegistrationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("[POST] /api/register - Invalid request body: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// TODO: Add validation using validator package

	// Create partner document
	partner := models.Partner{
		CompanyName:            req.CompanyName,
		Contacts:               req.Contacts,
		Country:                req.Country,
		PrimaryPartnerBusiness: req.PrimaryPartnerBusiness,
		MarketFocus:            req.MarketFocus,
		NumberOfEmployees:      req.NumberOfEmployees,
		AnnualRevenue:          req.AnnualRevenue,
		UseCases:               req.UseCases,
		GraphDatabaseFit:       req.GraphDatabaseFit,
		IndustryVerticalFocus:  req.IndustryVerticalFocus,
		KeyPartners:            req.KeyPartners,
		ArangoEngagements:      req.ArangoEngagements,
		TrainedStaffMembers:    req.TrainedStaffMembers,
		AIExperience:           req.AIExperience,
		AdditionalComments:     req.AdditionalComments,
		CreatedAt:              time.Now(),
		UpdatedAt:              time.Now(),
	}

	// Save to database
	ctx := context.Background()
	meta, err := h.db.GetPartnersCollection().CreateDocument(ctx, partner)
	if err != nil {
		log.Printf("[POST] /api/register - Failed to create partner: %v", err)
		http.Error(w, "Failed to save partner", http.StatusInternalServerError)
		return
	}

	partner.ID = meta.Key

	log.Printf("[POST] /api/register - Successfully created partner: %s (ID: %s)", partner.CompanyName, meta.Key)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(partner)
}

// List godoc
// @Summary List all partners
// @Description Get paginated list of partners with optional filters
// @Tags partners
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(25)
// @Param companyName query string false "Filter by company name"
// @Param country query string false "Filter by country"
// @Param partnerType query string false "Filter by partner type"
// @Param registrationStatus query string false "Filter by registration status"
// @Success 200 {object} map[string]interface{} "Paginated partners"
// @Failure 500 {string} string "Internal server error"
// @Security BearerAuth
// @Router /partners [get]
func (h *PartnerHandler) List(w http.ResponseWriter, r *http.Request) {
	log.Printf("[GET] /api/partners - List request with query: %s", r.URL.RawQuery)
	ctx := context.Background()

	// Parse query parameters
	page := 1
	limit := 25
	companyName := r.URL.Query().Get("companyName")
	country := r.URL.Query().Get("country")
	partnerType := r.URL.Query().Get("partnerType")
	registrationStatus := r.URL.Query().Get("registrationStatus")

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

	if companyName != "" {
		filterConditions = append(filterConditions, "LOWER(p.companyName) LIKE @companyName")
		bindVars["companyName"] = "%" + strings.ToLower(companyName) + "%"
	}

	if country != "" {
		filterConditions = append(filterConditions, "LOWER(p.country) LIKE @country")
		bindVars["country"] = "%" + strings.ToLower(country) + "%"
	}

	if partnerType != "" {
		filterConditions = append(filterConditions, "@partnerType IN p.primaryPartnerBusiness")
		bindVars["partnerType"] = partnerType
	}

	if registrationStatus != "" {
		filterConditions = append(filterConditions, "p.registrationStatus == @registrationStatus")
		bindVars["registrationStatus"] = registrationStatus
	}

	// Build query
	filterClause := ""
	if len(filterConditions) > 0 {
		filterClause = "FILTER " + strings.Join(filterConditions, " AND ")
	}

	// Count total
	countQuery := fmt.Sprintf("FOR p IN partners %s COLLECT WITH COUNT INTO total RETURN total", filterClause)
	countCursor, err := h.db.GetDatabase().Query(ctx, countQuery, bindVars)
	if err != nil {
		log.Printf("[GET] /api/partners - Failed to count partners: %v", err)
		http.Error(w, "Failed to count partners", http.StatusInternalServerError)
		return
	}
	defer countCursor.Close()

	var total int64
	if countCursor.HasMore() {
		countCursor.ReadDocument(ctx, &total)
	}

	// Get paginated results
	offset := (page - 1) * limit
	query := fmt.Sprintf("FOR p IN partners %s SORT p.createdAt DESC LIMIT %d, %d RETURN p", filterClause, offset, limit)

	cursor, err := h.db.GetDatabase().Query(ctx, query, bindVars)
	if err != nil {
		log.Printf("[GET] /api/partners - Failed to query partners: %v", err)
		http.Error(w, "Failed to query partners", http.StatusInternalServerError)
		return
	}
	defer cursor.Close()

	var partners []models.Partner
	for cursor.HasMore() {
		var partner models.Partner
		_, err := cursor.ReadDocument(ctx, &partner)
		if err != nil {
			continue
		}
		partners = append(partners, partner)
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))

	response := map[string]interface{}{
		"data":       partners,
		"total":      total,
		"page":       page,
		"limit":      limit,
		"totalPages": totalPages,
	}

	log.Printf("[GET] /api/partners - Successfully returned %d partners (page %d/%d, total: %d)", len(partners), page, totalPages, total)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetByID godoc
// @Summary Get partner by ID
// @Description Get a single partner by its ID
// @Tags partners
// @Accept json
// @Produce json
// @Param id path string true "Partner ID"
// @Success 200 {object} models.Partner
// @Failure 400 {string} string "Missing partner ID"
// @Failure 404 {string} string "Partner not found"
// @Security BearerAuth
// @Router /partners/{id} [get]
func (h *PartnerHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	log.Printf("[GET] /api/partners/%s - Get partner by ID", id)
	if id == "" {
		http.Error(w, "Missing partner ID", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	var partner models.Partner
	_, err := h.db.GetPartnersCollection().ReadDocument(ctx, id, &partner)
	if err != nil {
		log.Printf("[GET] /api/partners/%s - Partner not found: %v", id, err)
		http.Error(w, "Partner not found", http.StatusNotFound)
		return
	}

	log.Printf("[GET] /api/partners/%s - Successfully retrieved partner: %s", id, partner.CompanyName)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(partner)
}

// Update godoc
// @Summary Update partner
// @Description Update partner details or status
// @Tags partners
// @Accept json
// @Produce json
// @Param id path string true "Partner ID"
// @Param partner body models.Partner true "Partner update data"
// @Success 200 {object} models.Partner
// @Failure 400 {string} string "Invalid request"
// @Failure 404 {string} string "Partner not found"
// @Failure 500 {string} string "Internal server error"
// @Security BearerAuth
// @Router /partners/{id} [put]
func (h *PartnerHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	log.Printf("[PUT] /api/partners/%s - Update partner request", id)
	if id == "" {
		http.Error(w, "Missing partner ID", http.StatusBadRequest)
		return
	}

	var req models.PartnerRegistrationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("[PUT] /api/partners/%s - Invalid request body: %v", id, err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	ctx := context.Background()

	// Check if partner exists
	var existing models.Partner
	_, err := h.db.GetPartnersCollection().ReadDocument(ctx, id, &existing)
	if err != nil {
		log.Printf("[PUT] /api/partners/%s - Partner not found: %v", id, err)
		http.Error(w, "Partner not found", http.StatusNotFound)
		return
	}

	// Preserve existing status history
	statusHistory := existing.StatusHistory
	if statusHistory == nil {
		statusHistory = []models.StatusHistoryEntry{}
	}

	// If status changed and history entry provided, append it
	if req.StatusHistoryEntry != nil && req.RegistrationStatus != existing.RegistrationStatus {
		statusHistory = append(statusHistory, *req.StatusHistoryEntry)
	}

	// Update partner document
	partner := models.Partner{
		ID:                     id,
		CompanyName:            req.CompanyName,
		Contacts:               req.Contacts,
		Country:                req.Country,
		PrimaryPartnerBusiness: req.PrimaryPartnerBusiness,
		MarketFocus:            req.MarketFocus,
		NumberOfEmployees:      req.NumberOfEmployees,
		AnnualRevenue:          req.AnnualRevenue,
		UseCases:               req.UseCases,
		GraphDatabaseFit:       req.GraphDatabaseFit,
		IndustryVerticalFocus:  req.IndustryVerticalFocus,
		KeyPartners:            req.KeyPartners,
		ArangoEngagements:      req.ArangoEngagements,
		TrainedStaffMembers:    req.TrainedStaffMembers,
		AIExperience:           req.AIExperience,
		AdditionalComments:     req.AdditionalComments,
		RegistrationStatus:     req.RegistrationStatus,
		StatusHistory:          statusHistory,
		CreatedAt:              existing.CreatedAt,
		UpdatedAt:              time.Now(),
	}

	_, err = h.db.GetPartnersCollection().UpdateDocument(ctx, id, partner)
	if err != nil {
		log.Printf("[PUT] /api/partners/%s - Failed to update partner: %v", id, err)
		http.Error(w, "Failed to update partner", http.StatusInternalServerError)
		return
	}

	log.Printf("[PUT] /api/partners/%s - Successfully updated partner: %s", id, partner.CompanyName)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(partner)
}

func (h *PartnerHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	log.Printf("[INFO] [DELETE] /api/partners/%s - Delete partner request", id)

	if id == "" {
		http.Error(w, "Missing partner ID", http.StatusBadRequest)
		return
	}

	ctx := context.Background()

	// Get existing partner
	var existingPartner models.Partner
	_, err := h.db.GetPartnersCollection().ReadDocument(ctx, id, &existingPartner)
	if err != nil {
		log.Printf("[ERROR] [DELETE] /api/partners/%s - Partner not found: %v", id, err)
		http.Error(w, "Partner not found", http.StatusNotFound)
		return
	}

	// Delete partner document
	_, err = h.db.GetPartnersCollection().RemoveDocument(ctx, id)
	if err != nil {
		log.Printf("[ERROR] [DELETE] /api/partners/%s - Failed to delete partner: %v", id, err)
		http.Error(w, "Failed to delete partner", http.StatusInternalServerError)
		return
	}

	log.Printf("[INFO] [DELETE] /api/partners/%s - Successfully deleted partner: %s", id, existingPartner.CompanyName)
	w.WriteHeader(http.StatusNoContent)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Partner deleted successfully",
		"id":      id,
	})
}
