.PHONY: front-end back-end build-back-end seed swagger

swagger:
	@echo "Generating Swagger documentation..."
	cd back-end && ~/go/bin/swag init -g cmd/api/main.go -o docs
	@echo "Swagger docs generated successfully"

build-back-end: swagger
	@echo "Building backend API..."
	cd back-end && go build -o bin/api ./cmd/api
	@echo "Building seed tool..."
	cd back-end && go build -o bin/seed ./cmd/seed
	@echo "Backend build complete"

seed:
	cd back-end && go run ./cmd/seed

front-end:
	cd front-end && npm run dev

back-end: swagger
	cd back-end && go run ./cmd/api
