package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	"github.com/pedrocassalpacheco/partner-portal/back-end/internal/database"
)

type HealthHandler struct {
	db *database.ArangoClient
}

func NewHealthHandler(db *database.ArangoClient) *HealthHandler {
	return &HealthHandler{db: db}
}

// Health godoc
// @Summary Health check
// @Description Check if the API and database are healthy
// @Tags health
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 503 {object} map[string]interface{}
// @Router /health [get]
func (h *HealthHandler) Health(w http.ResponseWriter, r *http.Request) {
	log.Printf("[INFO] [GET] /api/health - Health check called: %s %s", r.Method, r.URL.Path)

	response := map[string]interface{}{
		"service": "partner-portal-api",
		"status":  "healthy",
	}

	// Check database connection
	ctx := context.Background()
	_, err := h.db.GetDatabase().Query(ctx, "RETURN 1", nil)
	if err != nil {
		log.Printf("[ERROR] [GET] /api/health - Database health check failed: %v", err)
		response["status"] = "unhealthy"
		response["database"] = "disconnected"
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusServiceUnavailable)
		json.NewEncoder(w).Encode(response)
		return
	}

	response["database"] = "connected"
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
