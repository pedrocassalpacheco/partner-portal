package main

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/joho/godotenv"
	"github.com/pedrocassalpacheco/partner-portal/back-end/internal/database"
	"github.com/pedrocassalpacheco/partner-portal/back-end/internal/models"
	"golang.org/x/crypto/bcrypt"
)

type PartnerSeed struct {
	CompanyName            string                  `json:"companyName"`
	Contacts               []models.PartnerContact `json:"contacts"`
	Country                string                  `json:"country"`
	PrimaryPartnerBusiness []string                `json:"primaryPartnerBusiness"`
	MarketFocus            []string                `json:"marketFocus"`
	NumberOfEmployees      string                  `json:"numberOfEmployees"`
	AnnualRevenue          string                  `json:"annualRevenue"`
	UseCases               []string                `json:"useCases"`
	GraphDatabaseFit       string                  `json:"graphDatabaseFit"`
	IndustryVerticalFocus  []string                `json:"industryVerticalFocus"`
	KeyPartners            string                  `json:"keyPartners"`
	ArangoEngagements      string                  `json:"arangoEngagements"`
	TrainedStaffMembers    string                  `json:"trainedStaffMembers"`
	AIExperience           string                  `json:"aiExperience"`
	AdditionalComments     string                  `json:"additionalComments"`
	RegistrationStatus     string                  `json:"registrationStatus"`
	DaysAgo                int                     `json:"daysAgo"`
}

type OpportunitySeed struct {
	PartnerIDIndex    int      `json:"partnerIdIndex"`
	AccountName       string   `json:"accountName"`
	ProductSkus       []string `json:"productSkus"`
	BudgetaryAmount   float64  `json:"budgetaryAmount"`
	ExpectedCloseDate string   `json:"expectedCloseDate"`
	Status            string   `json:"status"`
	DaysAgo           int      `json:"daysAgo"`
}

type ProductSeed struct {
	SKU         string `json:"sku"`
	Name        string `json:"name"`
	Category    string `json:"category"`
	Description string `json:"description"`
	IsActive    bool   `json:"isActive"`
}

type AccountSeed struct {
	Username    string `json:"username"`
	Password    string `json:"password"`
	Email       string `json:"email"`
	FirstName   string `json:"firstName"`
	LastName    string `json:"lastName"`
	Role        string `json:"role"`
	IsActive    bool   `json:"isActive"`
	CompanyName string `json:"companyName"`
}

func main() {
	// Load .env file from project root
	if err := godotenv.Load("/Users/pedropacheco/Projects/partner-portal/.env"); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Initialize ArangoDB connection
	db, err := database.NewArangoClient(
		os.Getenv("ARANGO_URL"),
		os.Getenv("ARANGO_DATABASE"),
		os.Getenv("ARANGO_USERNAME"),
		os.Getenv("ARANGO_PASSWORD"),
	)
	if err != nil {
		log.Fatalf("Failed to connect to ArangoDB: %v", err)
	}
	defer db.Close()

	ctx := context.Background()

	// Truncate existing collections
	log.Println("Truncating existing collections...")
	if err := db.GetPartnersCollection().Truncate(ctx); err != nil {
		log.Printf("Warning: Failed to truncate partners collection: %v", err)
	} else {
		log.Println("✓ Truncated partners collection")
	}

	if err := db.GetOpportunitiesCollection().Truncate(ctx); err != nil {
		log.Printf("Warning: Failed to truncate opportunities collection: %v", err)
	} else {
		log.Println("✓ Truncated opportunities collection")
	}

	if err := db.GetProductsCollection().Truncate(ctx); err != nil {
		log.Printf("Warning: Failed to truncate products collection: %v", err)
	} else {
		log.Println("✓ Truncated products collection")
	}

	if err := db.GetAccountsCollection().Truncate(ctx); err != nil {
		log.Printf("Warning: Failed to truncate accounts collection: %v", err)
	} else {
		log.Println("✓ Truncated accounts collection")
	}

	// Determine the data directory path
	// When running with "go run", use relative path from cmd/seed
	seedDir := "cmd/seed/data"

	// Check if the relative path exists, if not try absolute path
	if _, err := os.Stat(seedDir); os.IsNotExist(err) {
		// Try from back-end directory
		seedDir = "data"
		if _, err := os.Stat(seedDir); os.IsNotExist(err) {
			log.Fatalf("Cannot find data directory. Tried: cmd/seed/data and data")
		}
	}

	// Load partners from JSON
	partnersFile := filepath.Join(seedDir, "partners.json")
	partnersData, err := os.ReadFile(partnersFile)
	if err != nil {
		log.Fatalf("Failed to read partners.json: %v", err)
	}

	var partnerSeeds []PartnerSeed
	if err := json.Unmarshal(partnersData, &partnerSeeds); err != nil {
		log.Fatalf("Failed to parse partners.json: %v", err)
	}

	log.Println("Starting to seed database with sample partners...")

	// Store partner IDs for linking opportunities
	partnerIDs := make([]string, len(partnerSeeds))

	for i, ps := range partnerSeeds {
		partner := models.Partner{
			CompanyName:            ps.CompanyName,
			Contacts:               ps.Contacts,
			Country:                ps.Country,
			PrimaryPartnerBusiness: ps.PrimaryPartnerBusiness,
			MarketFocus:            ps.MarketFocus,
			NumberOfEmployees:      ps.NumberOfEmployees,
			AnnualRevenue:          ps.AnnualRevenue,
			UseCases:               ps.UseCases,
			GraphDatabaseFit:       ps.GraphDatabaseFit,
			IndustryVerticalFocus:  ps.IndustryVerticalFocus,
			KeyPartners:            ps.KeyPartners,
			ArangoEngagements:      ps.ArangoEngagements,
			TrainedStaffMembers:    ps.TrainedStaffMembers,
			AIExperience:           ps.AIExperience,
			AdditionalComments:     ps.AdditionalComments,
			RegistrationStatus:     ps.RegistrationStatus,
			CreatedAt:              time.Now().Add(-time.Duration(ps.DaysAgo) * 24 * time.Hour),
			UpdatedAt:              time.Now().Add(-time.Duration(ps.DaysAgo) * 24 * time.Hour),
		}

		meta, err := db.GetPartnersCollection().CreateDocument(ctx, partner)
		if err != nil {
			log.Printf("Failed to insert partner %d (%s): %v", i+1, partner.CompanyName, err)
			continue
		}
		partnerIDs[i] = meta.Key
		log.Printf("✓ Created partner: %s (ID: %s)", partner.CompanyName, meta.Key)
	}

	log.Printf("\n✅ Successfully seeded %d sample partners!", len(partnerSeeds))

	// Load opportunities from JSON
	opportunitiesFile := filepath.Join(seedDir, "opportunities.json")
	opportunitiesData, err := os.ReadFile(opportunitiesFile)
	if err != nil {
		log.Fatalf("Failed to read opportunities.json: %v", err)
	}

	var opportunitySeeds []OpportunitySeed
	if err := json.Unmarshal(opportunitiesData, &opportunitySeeds); err != nil {
		log.Fatalf("Failed to parse opportunities.json: %v", err)
	}

	log.Println("\nStarting to seed database with sample opportunities...")

	for i, os := range opportunitySeeds {
		// Parse the expected close date
		closeDate, err := time.Parse("2006-01-02", os.ExpectedCloseDate)
		if err != nil {
			log.Printf("Failed to parse close date for opportunity %d: %v", i+1, err)
			continue
		}

		opportunity := models.Opportunity{
			PartnerID:         partnerIDs[os.PartnerIDIndex],
			AccountName:       os.AccountName,
			ProductSKUs:       os.ProductSkus,
			BudgetaryAmount:   os.BudgetaryAmount,
			ExpectedCloseDate: closeDate,
			Status:            os.Status,
			CreatedAt:         time.Now().Add(-time.Duration(os.DaysAgo) * 24 * time.Hour),
			UpdatedAt:         time.Now().Add(-time.Duration(os.DaysAgo) * 24 * time.Hour),
		}

		meta, err := db.GetOpportunitiesCollection().CreateDocument(ctx, opportunity)
		if err != nil {
			log.Printf("Failed to insert opportunity %d (%s): %v", i+1, opportunity.AccountName, err)
			continue
		}
		log.Printf("✓ Created opportunity: %s (ID: %s, Partner: %s)", opportunity.AccountName, meta.Key, opportunity.PartnerID)
	}

	log.Printf("\n✅ Successfully seeded %d sample opportunities!", len(opportunitySeeds))

	// Load products from JSON
	productsFile := filepath.Join(seedDir, "products.json")
	productsData, err := os.ReadFile(productsFile)
	if err != nil {
		log.Fatalf("Failed to read products.json: %v", err)
	}

	var productSeeds []ProductSeed
	if err := json.Unmarshal(productsData, &productSeeds); err != nil {
		log.Fatalf("Failed to parse products.json: %v", err)
	}

	log.Println("\nStarting to seed database with products...")

	for i, ps := range productSeeds {
		product := models.Product{
			SKU:         ps.SKU,
			Name:        ps.Name,
			Category:    ps.Category,
			Description: ps.Description,
			IsActive:    ps.IsActive,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}

		meta, err := db.GetProductsCollection().CreateDocument(ctx, product)
		if err != nil {
			log.Printf("Failed to insert product %d (%s): %v", i+1, product.Name, err)
			continue
		}
		log.Printf("✓ Created product: %s (SKU: %s, ID: %s)", product.Name, product.SKU, meta.Key)
	}

	log.Printf("\n✅ Successfully seeded %d products!", len(productSeeds))

	// Load accounts from JSON
	accountsFile := filepath.Join(seedDir, "accounts.json")
	accountsData, err := os.ReadFile(accountsFile)
	if err != nil {
		log.Fatalf("Failed to read accounts.json: %v", err)
	}

	var accountSeeds []AccountSeed
	if err := json.Unmarshal(accountsData, &accountSeeds); err != nil {
		log.Fatalf("Failed to parse accounts.json: %v", err)
	}

	log.Println("\nStarting to seed database with accounts...")

	// Build a map of company name to partner ID for approved partners
	partnerMap := make(map[string]string)
	for i, ps := range partnerSeeds {
		if ps.RegistrationStatus == "approved" {
			partnerMap[ps.CompanyName] = partnerIDs[i]
		}
	}

	for i, as := range accountSeeds {
		// Find the partner ID by company name
		partnerID, ok := partnerMap[as.CompanyName]
		if !ok {
			log.Printf("Warning: No approved partner found for company %s, skipping account %s", as.CompanyName, as.Username)
			continue
		}

		// Hash the password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(as.Password), bcrypt.DefaultCost)
		if err != nil {
			log.Printf("Failed to hash password for account %d (%s): %v", i+1, as.Username, err)
			continue
		}

		account := models.Account{
			PartnerID:    partnerID,
			Username:     as.Username,
			PasswordHash: string(hashedPassword),
			Email:        as.Email,
			FirstName:    as.FirstName,
			LastName:     as.LastName,
			Role:         as.Role,
			IsActive:     as.IsActive,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		}

		meta, err := db.GetAccountsCollection().CreateDocument(ctx, account)
		if err != nil {
			log.Printf("Failed to insert account %d (%s): %v", i+1, account.Username, err)
			continue
		}
		log.Printf("✓ Created account: %s (ID: %s, Partner: %s)", account.Username, meta.Key, as.CompanyName)
	}

	log.Printf("\n✅ Successfully seeded %d accounts!", len(accountSeeds))
}
