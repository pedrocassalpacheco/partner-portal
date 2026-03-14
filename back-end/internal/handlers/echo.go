package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
)

func Echo(w http.ResponseWriter, r *http.Request) {
	// Read the request body
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	// Parse JSON to format it nicely
	var data map[string]interface{}
	if err := json.Unmarshal(body, &data); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Log the received data to stdout
	prettyJSON, _ := json.MarshalIndent(data, "", "  ")
	fmt.Println("\n========== ECHO SERVICE ==========")
	fmt.Printf("Received at: %s\n", r.Header.Get("Date"))
	fmt.Printf("Content-Type: %s\n", r.Header.Get("Content-Type"))
	fmt.Println("\nJSON Payload:")
	fmt.Println(string(prettyJSON))
	fmt.Println("==================================\n")

	// Also log using standard logger
	log.Printf("Echo received %d bytes of JSON data", len(body))

	// Return success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "success",
		"message": "Data received and logged to stdout",
		"bytes":   len(body),
	})
}
