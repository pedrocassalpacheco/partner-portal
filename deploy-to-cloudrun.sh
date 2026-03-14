#!/bin/bash

# Google Cloud Run Deployment Script
# Prerequisites:
# 1. Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install
# 2. Authenticate: gcloud auth login
# 3. Set up project: gcloud config set project YOUR_PROJECT_ID
# 4. Enable required APIs:
#    gcloud services enable run.googleapis.com
#    gcloud services enable cloudbuild.googleapis.com
#    gcloud services enable artifactregistry.googleapis.com

set -e

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-your-project-id}"
REGION="${GCP_REGION:-us-central1}"
BACKEND_SERVICE="partner-portal-backend"
FRONTEND_SERVICE="partner-portal-frontend"
ARANGO_URL="${ARANGO_URL:-https://your-arangodb-cloud-instance.arangodb.cloud}"
ARANGO_DATABASE="${ARANGO_DATABASE:-partner_portal}"
ARANGO_USERNAME="${ARANGO_USERNAME:-root}"
ARANGO_PASSWORD="${ARANGO_PASSWORD:-changeme}"
JWT_SECRET="${JWT_SECRET:-your-jwt-secret-change-in-production}"

echo "🚀 Deploying Partner Portal to Google Cloud Run"
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
    echo "❌ Not authenticated. Please run: gcloud auth login"
    exit 1
fi

# Set project
gcloud config set project "$PROJECT_ID"

echo "📦 Building and deploying backend service..."
gcloud run deploy "$BACKEND_SERVICE" \
    --source ./back-end \
    --region "$REGION" \
    --platform managed \
    --allow-unauthenticated \
    --set-env-vars "PORT=8080,JWT_SECRET=$JWT_SECRET,ARANGO_URL=$ARANGO_URL,ARANGO_DATABASE=$ARANGO_DATABASE,ARANGO_USERNAME=$ARANGO_USERNAME,ARANGO_PASSWORD=$ARANGO_PASSWORD" \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --timeout 300

# Get backend URL
BACKEND_URL=$(gcloud run services describe "$BACKEND_SERVICE" --region "$REGION" --format 'value(status.url)')
echo "✅ Backend deployed at: $BACKEND_URL"

# Update frontend API configuration
echo "📦 Building and deploying frontend service..."
# Note: You'll need to update your frontend to use an environment variable for API URL
gcloud run deploy "$FRONTEND_SERVICE" \
    --source ./front-end \
    --region "$REGION" \
    --platform managed \
    --allow-unauthenticated \
    --set-env-vars "VITE_API_URL=$BACKEND_URL" \
    --memory 256Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --timeout 60

# Get frontend URL
FRONTEND_URL=$(gcloud run services describe "$FRONTEND_SERVICE" --region "$REGION" --format 'value(status.url)')
echo "✅ Frontend deployed at: $FRONTEND_URL"

echo ""
echo "🎉 Deployment complete!"
echo "Backend:  $BACKEND_URL"
echo "Frontend: $FRONTEND_URL"
echo ""
echo "⚠️  Next steps:"
echo "1. Set up ArangoDB database (Cloud or self-hosted)"
echo "2. Update frontend to use backend URL"
echo "3. Configure CORS in backend for frontend domain"
echo "4. Set up custom domain (optional)"
echo "5. Configure authentication and security"
