package database

import (
	"context"
	"fmt"

	driver "github.com/arangodb/go-driver"
	"github.com/arangodb/go-driver/http"
)

type ArangoClient struct {
	client        driver.Client
	db            driver.Database
	partners      driver.Collection
	opportunities driver.Collection
	products      driver.Collection
	accounts      driver.Collection
}

func NewArangoClient(url, dbName, username, password string) (*ArangoClient, error) {
	// Set defaults
	if url == "" {
		url = "http://localhost:8529"
	}
	if dbName == "" {
		dbName = "partner_portal"
	}

	// Create HTTP connection
	conn, err := http.NewConnection(http.ConnectionConfig{
		Endpoints: []string{url},
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create connection: %w", err)
	}

	// Create client
	client, err := driver.NewClient(driver.ClientConfig{
		Connection:     conn,
		Authentication: driver.BasicAuthentication(username, password),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create client: %w", err)
	}

	// Get or create database
	ctx := context.Background()
	var db driver.Database
	exists, err := client.DatabaseExists(ctx, dbName)
	if err != nil {
		return nil, fmt.Errorf("failed to check database: %w", err)
	}

	if !exists {
		db, err = client.CreateDatabase(ctx, dbName, nil)
		if err != nil {
			return nil, fmt.Errorf("failed to create database: %w", err)
		}
	} else {
		db, err = client.Database(ctx, dbName)
		if err != nil {
			return nil, fmt.Errorf("failed to open database: %w", err)
		}
	}

	// Get or create partners collection
	var partners driver.Collection
	collectionExists, err := db.CollectionExists(ctx, "partners")
	if err != nil {
		return nil, fmt.Errorf("failed to check collection: %w", err)
	}

	if !collectionExists {
		partners, err = db.CreateCollection(ctx, "partners", nil)
		if err != nil {
			return nil, fmt.Errorf("failed to create collection: %w", err)
		}
	} else {
		partners, err = db.Collection(ctx, "partners")
		if err != nil {
			return nil, fmt.Errorf("failed to open collection: %w", err)
		}
	}

	// Get or create opportunities collection
	var opportunities driver.Collection
	opportunitiesExists, err := db.CollectionExists(ctx, "opportunities")
	if err != nil {
		return nil, fmt.Errorf("failed to check opportunities collection: %w", err)
	}

	if !opportunitiesExists {
		opportunities, err = db.CreateCollection(ctx, "opportunities", nil)
		if err != nil {
			return nil, fmt.Errorf("failed to create opportunities collection: %w", err)
		}
	} else {
		opportunities, err = db.Collection(ctx, "opportunities")
		if err != nil {
			return nil, fmt.Errorf("failed to open opportunities collection: %w", err)
		}
	}

	// Get or create products collection
	var products driver.Collection
	productsExists, err := db.CollectionExists(ctx, "products")
	if err != nil {
		return nil, fmt.Errorf("failed to check products collection: %w", err)
	}

	if !productsExists {
		products, err = db.CreateCollection(ctx, "products", nil)
		if err != nil {
			return nil, fmt.Errorf("failed to create products collection: %w", err)
		}
	} else {
		products, err = db.Collection(ctx, "products")
		if err != nil {
			return nil, fmt.Errorf("failed to open products collection: %w", err)
		}
	}

	// Get or create accounts collection
	var accounts driver.Collection
	accountsExists, err := db.CollectionExists(ctx, "accounts")
	if err != nil {
		return nil, fmt.Errorf("failed to check accounts collection: %w", err)
	}

	if !accountsExists {
		accounts, err = db.CreateCollection(ctx, "accounts", nil)
		if err != nil {
			return nil, fmt.Errorf("failed to create accounts collection: %w", err)
		}
	} else {
		accounts, err = db.Collection(ctx, "accounts")
		if err != nil {
			return nil, fmt.Errorf("failed to open accounts collection: %w", err)
		}
	}

	return &ArangoClient{
		client:        client,
		db:            db,
		partners:      partners,
		opportunities: opportunities,
		products:      products,
		accounts:      accounts,
	}, nil
}

func (ac *ArangoClient) GetPartnersCollection() driver.Collection {
	return ac.partners
}

func (ac *ArangoClient) GetOpportunitiesCollection() driver.Collection {
	return ac.opportunities
}

func (ac *ArangoClient) GetProductsCollection() driver.Collection {
	return ac.products
}

func (ac *ArangoClient) GetAccountsCollection() driver.Collection {
	return ac.accounts
}

func (ac *ArangoClient) GetDatabase() driver.Database {
	return ac.db
}

func (ac *ArangoClient) Close() {
	// HTTP connections are stateless, no need to close
}
