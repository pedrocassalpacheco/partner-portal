package models

import "time"

type Product struct {
	ID          string    `json:"_key,omitempty"`
	SKU         string    `json:"sku"`
	Name        string    `json:"name"`
	Category    string    `json:"category"`
	Description string    `json:"description"`
	IsActive    bool      `json:"isActive"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type ProductRequest struct {
	SKU         string `json:"sku" validate:"required"`
	Name        string `json:"name" validate:"required"`
	Category    string `json:"category" validate:"required"`
	Description string `json:"description"`
	IsActive    bool   `json:"isActive"`
}
