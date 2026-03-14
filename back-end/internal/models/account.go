package models

import "time"

type Account struct {
	ID           string    `json:"_key,omitempty"`
	PartnerID    string    `json:"partnerId"`
	Username     string    `json:"username"`
	PasswordHash string    `json:"passwordHash"`
	Email        string    `json:"email"`
	FirstName    string    `json:"firstName"`
	LastName     string    `json:"lastName"`
	Role         string    `json:"role"` // "partner", "admin"
	IsActive     bool      `json:"isActive"`
	LastLoginAt  time.Time `json:"lastLoginAt,omitempty"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type AccountCreateRequest struct {
	PartnerID string `json:"partnerId" validate:"required"`
	Username  string `json:"username" validate:"required,min=3"`
	Password  string `json:"password" validate:"required,min=8"`
	Email     string `json:"email" validate:"required,email"`
	FirstName string `json:"firstName" validate:"required"`
	LastName  string `json:"lastName" validate:"required"`
	Role      string `json:"role" validate:"required,oneof=partner admin"`
}

type AccountUpdateRequest struct {
	Email     string `json:"email,omitempty" validate:"omitempty,email"`
	FirstName string `json:"firstName,omitempty"`
	LastName  string `json:"lastName,omitempty"`
	IsActive  *bool  `json:"isActive,omitempty"`
}

type ChangePasswordRequest struct {
	CurrentPassword string `json:"currentPassword" validate:"required"`
	NewPassword     string `json:"newPassword" validate:"required,min=8"`
}
