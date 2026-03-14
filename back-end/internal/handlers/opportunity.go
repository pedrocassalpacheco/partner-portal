package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	driver "github.com/arangodb/go-driver"
	"github.com/pedrocassalpacheco/partner-portal/back-end/internal/database"
	"github.com/pedrocassalpacheco/partner-portal/back-end/internal/models"
)

type OpportunityHandler struct {
	db *database.ArangoClient
}

func NewOpportunityHandler(db *database.ArangoClient) *OpportunityHandler {
	return &OpportunityHandler{db: db}
}

// Create godoc
// @Summary Create new opportunity
// @Description Register a new opportunity
// @Tags opportunities
// @Accept json
// @Produce json
// @Param opportunity body models.OpportunityRequest true "Opportunity data"
// @Success 201 {object} models.Opportunity
// @Failure 400 {string} string "Invalid request body"
// @Failure 500 {string} string "Internal server error"
// @Security BearerAuth
// @Router /opportunities [post]
func (h *OpportunityHandler) Create(w http.ResponseWriter, r *http.Request) {
	log.Printf("[POST] /api/opportunities - Create opportunity request")
	var req models.OpportunityRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("[POST] /api/opportunities - Invalid request body: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Create opportunity with timestamps
	opportunity := models.Opportunity{
		PartnerID:         req.PartnerID,
		AccountName:       req.AccountName,
		ProductSKUs:       req.ProductSKUs,
		Quantity:          req.Quantity,
		BudgetaryAmount:   req.BudgetaryAmount,
		CustomerContact:   req.CustomerContact,
		ExpectedCloseDate: req.ExpectedCloseDate,
		Status:            req.Status,
		CreatedAt:         time.Now(),
		UpdatedAt:         time.Now(),
	}

	ctx := context.Background()
	meta, err := h.db.GetOpportunitiesCollection().CreateDocument(ctx, opportunity)
	if err != nil {
		log.Printf("[POST] /api/opportunities - Failed to create opportunity: %v", err)
		http.Error(w, "Failed to create opportunity", http.StatusInternalServerError)
		return
	}

	opportunity.ID = meta.Key

	log.Printf("[POST] /api/opportunities - Successfully created opportunity (ID: %s) for partner: %s", meta.Key, opportunity.PartnerID)

	log.Printf("[POST] /api/opportunities - Successfully created opportunity (ID: %s) for partner: %s", meta.Key, opportunity.PartnerID)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(opportunity)
}

// List - Get all opportunities with pagination (GET /api/opportunities)
func (h *OpportunityHandler) List(w http.ResponseWriter, r *http.Request) {
	log.Printf("[GET] /api/opportunities - List request with query: %s", r.URL.RawQuery)
	ctx := context.Background()

	// Parse query parameters
	page := 1
	limit := 25
	partnerID := r.URL.Query().Get("partnerId")
	status := r.URL.Query().Get("status")

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

	if partnerID != "" {
		filterConditions = append(filterConditions, "o.partnerId == @partnerId")
		bindVars["partnerId"] = partnerID
	}

	if status != "" {
		filterConditions = append(filterConditions, "LOWER(o.status) == @status")
		bindVars["status"] = strings.ToLower(status)
	}

	// Build query
	filterClause := ""
	if len(filterConditions) > 0 {
		filterClause = "FILTER " + strings.Join(filterConditions, " AND ")
	}

	// Count total
	countQuery := fmt.Sprintf("FOR o IN opportunities %s COLLECT WITH COUNT INTO total RETURN total", filterClause)
	countCursor, err := h.db.GetDatabase().Query(ctx, countQuery, bindVars)
	if err != nil {
		log.Printf("[GET] /api/opportunities - Failed to count opportunities: %v", err)
		http.Error(w, "Failed to count opportunities", http.StatusInternalServerError)
		return
	}
	defer countCursor.Close()

	var total int64
	if countCursor.HasMore() {
		countCursor.ReadDocument(ctx, &total)
	}

	// Get paginated results
	offset := (page - 1) * limit
	query := fmt.Sprintf("FOR o IN opportunities %s SORT o.createdAt DESC LIMIT %d, %d RETURN o", filterClause, offset, limit)

	cursor, err := h.db.GetDatabase().Query(ctx, query, bindVars)
	if err != nil {
		log.Printf("[GET] /api/opportunities - Failed to query opportunities: %v", err)
		http.Error(w, "Failed to query opportunities", http.StatusInternalServerError)
		return
	}
	defer cursor.Close()

	var opportunities []models.Opportunity
	for cursor.HasMore() {
		var opportunity models.Opportunity
		_, err := cursor.ReadDocument(ctx, &opportunity)
		if err != nil {
			continue
		}
		opportunities = append(opportunities, opportunity)
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))

	response := map[string]interface{}{
		"data":       opportunities,
		"total":      total,
		"page":       page,
		"limit":      limit,
		"totalPages": totalPages,
	}

	log.Printf("[GET] /api/opportunities - Successfully returned %d opportunities (page %d/%d, total: %d)", len(opportunities), page, totalPages, total)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetByID - Get a specific opportunity (GET /api/opportunities/{id})
func (h *OpportunityHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		http.Error(w, "Opportunity ID is required", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	var opportunity models.Opportunity
	_, err := h.db.GetOpportunitiesCollection().ReadDocument(ctx, id, &opportunity)
	if err != nil {
		if driver.IsNotFound(err) {
			http.Error(w, "Opportunity not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Failed to fetch opportunity", http.StatusInternalServerError)
		return
	}

	opportunity.ID = id

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(opportunity)
}

// Update - Update an opportunity (PUT /api/opportunities/{id})
func (h *OpportunityHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		http.Error(w, "Opportunity ID is required", http.StatusBadRequest)
		return
	}

	var req models.OpportunityRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	ctx := context.Background()

	// First get the existing opportunity to preserve createdAt
	var existing models.Opportunity
	_, err := h.db.GetOpportunitiesCollection().ReadDocument(ctx, id, &existing)
	if err != nil {
		if driver.IsNotFound(err) {
			http.Error(w, "Opportunity not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Failed to fetch opportunity", http.StatusInternalServerError)
		return
	}

	// Update the opportunity
	opportunity := models.Opportunity{
		PartnerID:         req.PartnerID,
		AccountName:       req.AccountName,
		ProductSKUs:       req.ProductSKUs,
		Quantity:          req.Quantity,
		BudgetaryAmount:   req.BudgetaryAmount,
		CustomerContact:   req.CustomerContact,
		ExpectedCloseDate: req.ExpectedCloseDate,
		Status:            req.Status,
		CreatedAt:         existing.CreatedAt,
		UpdatedAt:         time.Now(),
	}

	_, err = h.db.GetOpportunitiesCollection().UpdateDocument(ctx, id, opportunity)
	if err != nil {
		http.Error(w, "Failed to update opportunity", http.StatusInternalServerError)
		return
	}

	opportunity.ID = id

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(opportunity)
}

// Delete - Delete an opportunity (DELETE /api/opportunities/{id})
func (h *OpportunityHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	log.Printf("[INFO] [DELETE] /api/opportunities/%s - Delete opportunity request", id)

	if id == "" {
		http.Error(w, "Opportunity ID is required", http.StatusBadRequest)
		return
	}

	ctx := context.Background()

	// Get existing opportunity
	var existingOpportunity models.Opportunity
	_, err := h.db.GetOpportunitiesCollection().ReadDocument(ctx, id, &existingOpportunity)
	if err != nil {
		if driver.IsNotFound(err) {
			log.Printf("[ERROR] [DELETE] /api/opportunities/%s - Opportunity not found: %v", id, err)
			http.Error(w, "Opportunity not found", http.StatusNotFound)
			return
		}
		log.Printf("[ERROR] [DELETE] /api/opportunities/%s - Failed to read opportunity: %v", id, err)
		http.Error(w, "Failed to read opportunity", http.StatusInternalServerError)
		return
	}

	// Delete opportunity document
	_, err = h.db.GetOpportunitiesCollection().RemoveDocument(ctx, id)
	if err != nil {
		log.Printf("[ERROR] [DELETE] /api/opportunities/%s - Failed to delete opportunity: %v", id, err)
		http.Error(w, "Failed to delete opportunity", http.StatusInternalServerError)
		return
	}

	log.Printf("[INFO] [DELETE] /api/opportunities/%s - Successfully deleted opportunity: %s", id, existingOpportunity.AccountName)
	w.WriteHeader(http.StatusNoContent)
}

// GetByPartnerID - Get all opportunities for a specific partner (GET /api/partners/{id}/opportunities)
func (h *OpportunityHandler) GetByPartnerID(w http.ResponseWriter, r *http.Request) {
	partnerID := r.PathValue("id")
	if partnerID == "" {
		http.Error(w, "Partner ID is required", http.StatusBadRequest)
		return
	}

	ctx := context.Background()

	query := "FOR o IN opportunities FILTER o.partnerId == @partnerId SORT o.createdAt DESC RETURN o"
	bindVars := map[string]interface{}{
		"partnerId": partnerID,
	}

	cursor, err := h.db.GetDatabase().Query(ctx, query, bindVars)
	if err != nil {
		log.Printf("[GET] /api/partners/%s/opportunities - Failed to query opportunities: %v", partnerID, err)
		http.Error(w, "Failed to query opportunities", http.StatusInternalServerError)
		return
	}
	defer cursor.Close()

	var opportunities []models.Opportunity
	for cursor.HasMore() {
		var opportunity models.Opportunity
		_, err := cursor.ReadDocument(ctx, &opportunity)
		if err != nil {
			http.Error(w, "Failed to read opportunity", http.StatusInternalServerError)
			return
		}
		opportunities = append(opportunities, opportunity)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(opportunities)
}
