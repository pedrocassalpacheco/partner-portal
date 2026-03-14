package models

import "time"

type StatusHistoryEntry struct {
	Timestamp      time.Time `json:"timestamp"`
	PreviousStatus string    `json:"previousStatus"`
	NewStatus      string    `json:"newStatus"`
	Comment        string    `json:"comment,omitempty"`
	ChangedBy      string    `json:"changedBy"`
}

type PartnerContact struct {
	Type          string `json:"type"`          // "business" or "technical"
	FirstName     string `json:"firstName"`
	LastName      string `json:"lastName"`
	JobTitle      string `json:"jobTitle"`
	BusinessEmail string `json:"businessEmail"`
	PhoneNumber   string `json:"phoneNumber"`
}

type Partner struct {
	ID                     string               `json:"_key,omitempty"`
	CompanyName            string               `json:"companyName"`
	Contacts               []PartnerContact     `json:"contacts"`
	Country                string               `json:"country"`
	PrimaryPartnerBusiness []string             `json:"primaryPartnerBusiness"`
	MarketFocus            []string             `json:"marketFocus"`
	NumberOfEmployees      string               `json:"numberOfEmployees"`
	AnnualRevenue          string               `json:"annualRevenue"`
	UseCases               []string             `json:"useCases"`
	GraphDatabaseFit       string               `json:"graphDatabaseFit"`
	IndustryVerticalFocus  []string             `json:"industryVerticalFocus"`
	KeyPartners            string               `json:"keyPartners"`
	ArangoEngagements      string               `json:"arangoEngagements"`
	TrainedStaffMembers    string               `json:"trainedStaffMembers"`
	AIExperience           string               `json:"aiExperience"`
	AdditionalComments     string               `json:"additionalComments"`
	RegistrationStatus     string               `json:"registrationStatus"`
	StatusHistory          []StatusHistoryEntry `json:"statusHistory,omitempty"`
	CreatedAt              time.Time            `json:"createdAt"`
	UpdatedAt              time.Time            `json:"updatedAt"`
}

type PartnerRegistrationRequest struct {
	CompanyName            string              `json:"companyName" validate:"required"`
	Contacts               []PartnerContact    `json:"contacts" validate:"required,min=1"`
	Country                string              `json:"country" validate:"required"`
	PrimaryPartnerBusiness []string            `json:"primaryPartnerBusiness" validate:"required,min=1"`
	MarketFocus            []string            `json:"marketFocus" validate:"required,min=1"`
	NumberOfEmployees      string              `json:"numberOfEmployees" validate:"required"`
	AnnualRevenue          string              `json:"annualRevenue" validate:"required"`
	UseCases               []string            `json:"useCases" validate:"required,min=1"`
	GraphDatabaseFit       string              `json:"graphDatabaseFit" validate:"required"`
	IndustryVerticalFocus  []string            `json:"industryVerticalFocus" validate:"required,min=1"`
	KeyPartners            string              `json:"keyPartners" validate:"required"`
	ArangoEngagements      string              `json:"arangoEngagements" validate:"required"`
	TrainedStaffMembers    string              `json:"trainedStaffMembers" validate:"required"`
	AIExperience           string              `json:"aiExperience" validate:"required"`
	AdditionalComments     string              `json:"additionalComments"`
	RegistrationStatus     string              `json:"registrationStatus"`
	StatusHistoryEntry     *StatusHistoryEntry `json:"statusHistoryEntry,omitempty"`
}
