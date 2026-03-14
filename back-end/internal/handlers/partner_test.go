package handlers
package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/pedrocassalpacheco/partner-portal/back-end/internal/models"
)

func TestPartnerHandler_Register_InvalidJSON(t *testing.T) {
	handler := NewPartnerHandler(nil)

	req := httptest.NewRequest(http.MethodPost, "/api/partners/register", bytes.NewBufferString("invalid json"))
	w := httptest.NewRecorder()

	handler.Register(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}

func TestPartnerHandler_Register_ValidRequest(t *testing.T) {
	t.Skip("Requires database connection - implement with mock")









































































}	}		t.Errorf("expected status %d, got %d", http.StatusBadRequest, w.Code)	if w.Code != http.StatusBadRequest {	handler.Delete(w, req)	w := httptest.NewRecorder()	req := httptest.NewRequest(http.MethodDelete, "/api/partners/", nil)	handler := NewPartnerHandler(nil)func TestPartnerHandler_Delete_MissingID(t *testing.T) {}	}		t.Errorf("expected status %d, got %d", http.StatusBadRequest, w.Code)	if w.Code != http.StatusBadRequest {	handler.Update(w, req)	w := httptest.NewRecorder()	req := httptest.NewRequest(http.MethodPut, "/api/partners/123", bytes.NewBufferString("invalid json"))	handler := NewPartnerHandler(nil)func TestPartnerHandler_Update_InvalidJSON(t *testing.T) {}	}		t.Errorf("expected status %d, got %d", http.StatusBadRequest, w.Code)	if w.Code != http.StatusBadRequest {	handler.GetByID(w, req)	w := httptest.NewRecorder()	req := httptest.NewRequest(http.MethodGet, "/api/partners/", nil)	handler := NewPartnerHandler(nil)func TestPartnerHandler_GetByID_MissingID(t *testing.T) {}	// Would check for StatusCreated if DB was mocked	handler.Register(w, req)	w := httptest.NewRecorder()	req.Header.Set("Content-Type", "application/json")	req := httptest.NewRequest(http.MethodPost, "/api/partners/register", bytes.NewBuffer(body))	body, _ := json.Marshal(partner)	}		AIExperience:           "8-12",		TrainedStaffMembers:    "10-15",		ArangoEngagements:      "5-10",		KeyPartners:            "AWS, Azure",		IndustryVerticalFocus:  []string{"Technology & Software"},		GraphDatabaseFit:       "Core technology",		UseCases:               []string{"Knowledge Graph"},		AnnualRevenue:          "$10M-$50M",		NumberOfEmployees:      "51-200",		MarketFocus:            []string{"Enterprise"},		PrimaryPartnerBusiness: []string{"Systems Integrator"},		Country:                "USA",		PhoneNumber:            "+1234567890",		BusinessEmail:          "john@test.com",		JobTitle:               "CTO",		LastName:               "Doe",		FirstName:              "John",		CompanyName:            "Test Company",	partner := models.PartnerRegistrationRequest{	handler := NewPartnerHandler(nil)	// This would require a mock database