package models

import "time"

type Opportunity struct {
	ID                string               `json:"_key,omitempty"`
	PartnerID         string               `json:"partnerId"`
	AccountName       string               `json:"accountName"`
	ProductSKUs       []string             `json:"productSkus"`
	Quantity          int                  `json:"quantity"`
	BudgetaryAmount   float64              `json:"budgetaryAmount"`
	CustomerContact   Contact              `json:"customerContact"`
	ExpectedCloseDate time.Time            `json:"expectedCloseDate"`
	Status            string               `json:"status"`
	StatusHistory     []StatusHistoryEntry `json:"statusHistory,omitempty"`
	PartnerComment    string               `json:"partnerComment"`
	VendorComment     string               `json:"vendorComment"`
	CreatedAt         time.Time            `json:"createdAt"`
	UpdatedAt         time.Time            `json:"updatedAt"`
}

type Contact struct {
	Name  string `json:"name"`
	Email string `json:"email"`
	Phone string `json:"phone"`
}

type OpportunityRequest struct {
	PartnerID         string    `json:"partnerId" validate:"required"`
	AccountName       string    `json:"accountName" validate:"required"`
	ProductSKUs       []string  `json:"productSkus" validate:"required,min=1"`
	Quantity          int       `json:"quantity" validate:"required,min=1"`
	BudgetaryAmount   float64   `json:"budgetaryAmount" validate:"required,min=0"`
	CustomerContact   Contact   `json:"customerContact" validate:"required"`
	ExpectedCloseDate time.Time `json:"expectedCloseDate" validate:"required"`
	Status            string    `json:"status" validate:"required"`
	PartnerComment    string    `json:"partnerComment"`
	VendorComment     string    `json:"vendorComment"`
}
