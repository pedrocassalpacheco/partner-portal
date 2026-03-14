package handlers
package handlers

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/pedrocassalpacheco/partner-portal/back-end/internal/database"
)










































}	// or a test database instance	// This test would require a mock ArangoDB client		t.Skip("Requires actual database connection - implement with mock")func TestHealthHandler_DatabaseCheck(t *testing.T) {}	}		})			}				t.Errorf("expected status %d, got %d", tt.expectedStatus, w.Code)			if w.Code != tt.expectedStatus && db != nil {			handler.Health(w, req)			w := httptest.NewRecorder()			req := httptest.NewRequest(http.MethodGet, "/api/health", nil)			handler := NewHealthHandler(db)			var db *database.ArangoClient			// In a real scenario, you'd use a mock or test database			// Create a mock database client (for now, we'll skip actual DB connection)		t.Run(tt.name, func(t *testing.T) {	for _, tt := range tests {	}		},			expectedBody:   `"status":"healthy"`,			expectedStatus: http.StatusOK,			dbConnected:    true,			name:           "healthy with database",		{	}{		expectedBody   string		expectedStatus int		dbConnected    bool		name           string	tests := []struct {func TestHealthHandler_Health(t *testing.T) {