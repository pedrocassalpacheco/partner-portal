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

type ProductHandler struct {
	db *database.ArangoClient
}

func NewProductHandler(db *database.ArangoClient) *ProductHandler {
	return &ProductHandler{db: db}
}

// List godoc
// @Summary List all products
// @Description Get paginated list of products with optional filters
// @Tags products
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(25)
// @Param name query string false "Filter by product name"
// @Param category query string false "Filter by category"
// @Param isActive query boolean false "Filter by active status"
// @Success 200 {object} map[string]interface{} "Paginated products"
// @Failure 500 {string} string "Internal server error"
// @Security BearerAuth
// @Router /products [get]
func (h *ProductHandler) List(w http.ResponseWriter, r *http.Request) {
	log.Printf("[INFO] [GET] /api/products - List request with query: %s", r.URL.RawQuery)
	ctx := context.Background()

	// Parse query parameters
	page := 1
	limit := 25
	nameFilter := r.URL.Query().Get("name")
	categoryFilter := r.URL.Query().Get("category")
	isActiveFilter := r.URL.Query().Get("isActive")

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

	if nameFilter != "" {
		filterConditions = append(filterConditions, "LOWER(p.name) LIKE @name OR LOWER(p.sku) LIKE @name")
		bindVars["name"] = "%" + strings.ToLower(nameFilter) + "%"
	}

	if categoryFilter != "" {
		filterConditions = append(filterConditions, "p.category == @category")
		bindVars["category"] = categoryFilter
	}

	if isActiveFilter != "" {
		if isActiveFilter == "true" {
			filterConditions = append(filterConditions, "p.isActive == true")
		} else if isActiveFilter == "false" {
			filterConditions = append(filterConditions, "p.isActive == false")
		}
	}

	// Build query
	filterClause := ""
	if len(filterConditions) > 0 {
		filterClause = "FILTER " + strings.Join(filterConditions, " AND ")
	}

	// Count total
	countQuery := fmt.Sprintf("FOR p IN products %s COLLECT WITH COUNT INTO total RETURN total", filterClause)
	countCursor, err := h.db.GetDatabase().Query(ctx, countQuery, bindVars)
	if err != nil {
		log.Printf("[ERROR] [GET] /api/products - Failed to count products: %v", err)
		http.Error(w, "Failed to count products", http.StatusInternalServerError)
		return
	}
	defer countCursor.Close()

	var total int64
	if countCursor.HasMore() {
		countCursor.ReadDocument(ctx, &total)
	}

	// Get paginated results
	offset := (page - 1) * limit
	query := fmt.Sprintf("FOR p IN products %s SORT p.category, p.name LIMIT %d, %d RETURN p", filterClause, offset, limit)

	cursor, err := h.db.GetDatabase().Query(ctx, query, bindVars)
	if err != nil {
		log.Printf("[ERROR] [GET] /api/products - Failed to query products: %v", err)
		http.Error(w, "Failed to query products", http.StatusInternalServerError)
		return
	}
	defer cursor.Close()

	var products []models.Product
	for cursor.HasMore() {
		var product models.Product
		_, err := cursor.ReadDocument(ctx, &product)
		if err != nil {
			continue
		}
		products = append(products, product)
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))

	response := map[string]interface{}{
		"data":       products,
		"total":      total,
		"page":       page,
		"limit":      limit,
		"totalPages": totalPages,
	}

	log.Printf("[INFO] [GET] /api/products - Successfully returned %d products (page %d/%d, total: %d)", len(products), page, totalPages, total)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetByID - Get a single product by ID (GET /api/products/:id)
func (h *ProductHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	log.Printf("[INFO] [GET] /api/products/%s - Get product by ID", id)
	if id == "" {
		http.Error(w, "Missing product ID", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	var product models.Product
	_, err := h.db.GetProductsCollection().ReadDocument(ctx, id, &product)
	if err != nil {
		log.Printf("[ERROR] [GET] /api/products/%s - Product not found: %v", id, err)
		http.Error(w, "Product not found", http.StatusNotFound)
		return
	}

	log.Printf("[INFO] [GET] /api/products/%s - Successfully retrieved product: %s", id, product.Name)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(product)
}

// Create - Create a new product (POST /api/products)
func (h *ProductHandler) Create(w http.ResponseWriter, r *http.Request) {
	log.Printf("[INFO] [POST] /api/products - Create product request")
	var req models.ProductRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("[ERROR] [POST] /api/products - Invalid request body: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Create product document
	ctx := context.Background()

	// Check if SKU already exists
	query := "FOR p IN products FILTER p.sku == @sku RETURN p"
	cursor, err := h.db.GetDatabase().Query(ctx, query, map[string]interface{}{"sku": req.SKU})
	if err == nil && cursor.HasMore() {
		cursor.Close()
		log.Printf("[ERROR] [POST] /api/products - SKU already exists: %s", req.SKU)
		http.Error(w, "Product with this SKU already exists", http.StatusConflict)
		return
	}
	if cursor != nil {
		cursor.Close()
	}

	product := models.Product{
		SKU:         req.SKU,
		Name:        req.Name,
		Category:    req.Category,
		Description: req.Description,
		IsActive:    req.IsActive,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	meta, err := h.db.GetProductsCollection().CreateDocument(ctx, product)
	if err != nil {
		log.Printf("[ERROR] [POST] /api/products - Failed to create product: %v", err)
		http.Error(w, "Failed to save product", http.StatusInternalServerError)
		return
	}

	product.ID = meta.Key

	log.Printf("[INFO] [POST] /api/products - Successfully created product: %s (ID: %s)", product.Name, meta.Key)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(product)
}

// Update - Update an existing product (PUT /api/products/:id)
func (h *ProductHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	log.Printf("[INFO] [PUT] /api/products/%s - Update product request", id)

	if id == "" {
		http.Error(w, "Missing product ID", http.StatusBadRequest)
		return
	}

	var req models.ProductRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("[ERROR] [PUT] /api/products/%s - Invalid request body: %v", id, err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	ctx := context.Background()

	// Get existing product
	var existingProduct models.Product
	_, err := h.db.GetProductsCollection().ReadDocument(ctx, id, &existingProduct)
	if err != nil {
		log.Printf("[ERROR] [PUT] /api/products/%s - Product not found: %v", id, err)
		http.Error(w, "Product not found", http.StatusNotFound)
		return
	}

	// Update fields
	existingProduct.Name = req.Name
	existingProduct.Category = req.Category
	existingProduct.Description = req.Description
	existingProduct.IsActive = req.IsActive
	existingProduct.UpdatedAt = time.Now()

	_, err = h.db.GetProductsCollection().UpdateDocument(ctx, id, existingProduct)
	if err != nil {
		log.Printf("[ERROR] [PUT] /api/products/%s - Failed to update product: %v", id, err)
		http.Error(w, "Failed to update product", http.StatusInternalServerError)
		return
	}

	log.Printf("[INFO] [PUT] /api/products/%s - Successfully updated product: %s", id, existingProduct.Name)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(existingProduct)
}

// Delete - Delete an existing product (DELETE /api/products/:id)
func (h *ProductHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	log.Printf("[INFO] [DELETE] /api/products/%s - Delete product request", id)

	if id == "" {
		http.Error(w, "Missing product ID", http.StatusBadRequest)
		return
	}

	ctx := context.Background()

	// Get existing product
	var existingProduct models.Product
	_, err := h.db.GetProductsCollection().ReadDocument(ctx, id, &existingProduct)
	if err != nil {
		log.Printf("[ERROR] [DELETE] /api/products/%s - Product not found: %v", id, err)
		http.Error(w, "Product not found", http.StatusNotFound)
		return
	}

	// Delete product document
	_, err = h.db.GetProductsCollection().RemoveDocument(ctx, id)
	if err != nil {
		log.Printf("[ERROR] [DELETE] /api/products/%s - Failed to delete product: %v", id, err)
		http.Error(w, "Failed to delete product", http.StatusInternalServerError)
		return
	}

	log.Printf("[INFO] [DELETE] /api/products/%s - Successfully deleted product: %s", id, existingProduct.Name)
	w.WriteHeader(http.StatusNoContent)
}
