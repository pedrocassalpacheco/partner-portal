package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestLogin_InvalidJSON(t *testing.T) {
	req := httptest.NewRequest(http.MethodPost, "/api/auth/login", bytes.NewBufferString("invalid json"))
	w := httptest.NewRecorder()

	Login(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}

func TestLogin_InvalidCredentials(t *testing.T) {
	loginReq := LoginRequest{
		Username: "wronguser",
		Password: "wrongpass",
	}

	body, _ := json.Marshal(loginReq)
	req := httptest.NewRequest(http.MethodPost, "/api/auth/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	Login(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected status %d, got %d", http.StatusUnauthorized, w.Code)
	}
}

func TestLogin_ValidCredentials(t *testing.T) {
	loginReq := LoginRequest{
		Username: "admin",
		Password: "admin123",
	}

	body, _ := json.Marshal(loginReq)



















}	}		t.Error("expected token to be returned")	if response.Token == "" {	}		t.Fatalf("failed to decode response: %v", err)	if err := json.NewDecoder(w.Body).Decode(&response); err != nil {	var response LoginResponse	}		t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)	if w.Code != http.StatusOK {	Login(w, req)	w := httptest.NewRecorder()	req.Header.Set("Content-Type", "application/json")	req := httptest.NewRequest(http.MethodPost, "/api/auth/login", bytes.NewBuffer(body))