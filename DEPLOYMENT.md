# Deployment Guide - Google Cloud Run

## Architecture Overview

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Frontend      │─────▶│   Backend API    │─────▶│   ArangoDB      │
│  (Cloud Run)    │      │   (Cloud Run)    │      │  (Cloud/Managed)│
│  React + Nginx  │      │   Go API         │      │                 │
└─────────────────┘      └──────────────────┘      └─────────────────┘
        ▲                         ▲
        │                         │
        └─────────────────────────┘
          User Access via HTTPS
```

## Why Not Docker Compose on Cloud Run?

Cloud Run **does not support docker-compose** because:
1. Each Cloud Run service runs a single container
2. Cloud Run is serverless - containers scale independently
3. Stateful services (like databases) don't fit the serverless model

## Deployment Options

### Option 1: Cloud Run + Managed Database (Recommended)

**Best for:** Production deployments, scalability, cost-efficiency

#### Components:
- **Frontend**: Cloud Run service (Nginx + React)
- **Backend**: Cloud Run service (Go API)
- **Database**: ArangoDB Cloud or self-managed instance

#### Steps:

1. **Set up ArangoDB**
   - Sign up for ArangoDB Cloud: https://cloud.arangodb.com/
   - Create a deployment and note the connection URL
   - Or: Self-host ArangoDB on Compute Engine or elsewhere

2. **Configure Environment Variables**
   ```bash
   export GCP_PROJECT_ID="your-project-id"
   export GCP_REGION="us-central1"
   export ARANGO_URL="https://your-instance.arangodb.cloud"
   export ARANGO_PASSWORD="your-secure-password"
   export JWT_SECRET="your-jwt-secret-256-bit"
   ```

3. **Deploy using the script**
   ```bash
   chmod +x deploy-to-cloudrun.sh
   ./deploy-to-cloudrun.sh
   ```

4. **Update Frontend API Configuration**
   - Get backend URL from Cloud Run console
   - Update frontend environment variables or hardcode the API URL

#### Pros:
✅ Fully managed, auto-scaling
✅ Pay only for what you use
✅ Easy SSL/TLS certificates
✅ Independent scaling of frontend/backend
✅ Built-in monitoring and logging

#### Cons:
❌ Requires external database
❌ Cold start latency (mitigated with min-instances)
❌ More complex networking setup

#### Monthly Cost Estimate:
- Frontend: ~$5-20 (depends on traffic)
- Backend: ~$10-30 (depends on traffic)
- ArangoDB Cloud: ~$50-200 (depends on plan)
- **Total: ~$65-250/month**

---

### Option 2: Google Kubernetes Engine (GKE)

**Best for:** Complex microservices, need full docker-compose features

#### Steps:

1. **Convert docker-compose to Kubernetes**
   ```bash
   # Install kompose
   curl -L https://github.com/kubernetes/kompose/releases/download/v1.31.2/kompose-linux-amd64 -o kompose
   chmod +x kompose
   sudo mv kompose /usr/local/bin/

   # Convert
   kompose convert -f docker-compose.yml
   ```

2. **Create GKE Cluster**
   ```bash
   gcloud container clusters create partner-portal \
     --zone us-central1-a \
     --num-nodes 2 \
     --machine-type e2-medium
   ```

3. **Deploy to GKE**
   ```bash
   kubectl apply -f .
   ```

#### Pros:
✅ Full docker-compose compatibility
✅ Run all containers together
✅ Persistent storage for database
✅ Advanced networking and orchestration

#### Cons:
❌ More expensive (~$150+/month minimum)
❌ Requires Kubernetes knowledge
❌ Manual scaling configuration
❌ More maintenance overhead

---

### Option 3: Cloud Run with Multi-Container (Beta)

**Best for:** Simple sidecar patterns (not suitable for your use case)

Cloud Run's multi-container feature only supports sidecars (auxiliary containers), not separate application services like frontend/backend/database.

---

### Option 4: Single VM with Docker Compose

**Best for:** Development, testing, low-traffic production

Deploy everything on a single Compute Engine VM:

```bash
# Create VM
gcloud compute instances create partner-portal-vm \
  --zone=us-central1-a \
  --machine-type=e2-medium \
  --image-family=cos-stable \
  --image-project=cos-cloud \
  --boot-disk-size=50GB

# SSH and install Docker
gcloud compute ssh partner-portal-vm --zone=us-central1-a

# Clone repo and run
git clone <your-repo>
cd partner-portal
docker-compose up -d
```

#### Pros:
✅ Uses existing docker-compose.yml
✅ Simple setup
✅ All containers on one machine
✅ Lower cost (~$30-50/month)

#### Cons:
❌ No auto-scaling
❌ Single point of failure
❌ Manual SSL certificate setup
❌ Manual backup management
❌ Limited to single machine resources

---

## Recommended Approach

For **production**: Use **Option 1** (Cloud Run + Managed Database)

### Why?
1. **Auto-scaling**: Handles traffic spikes automatically
2. **Cost-effective**: Pay per request, not for idle time
3. **Managed**: Google handles infrastructure
4. **Secure**: Built-in SSL, DDoS protection, IAM
5. **Fast deployments**: Deploy in seconds

### Implementation Checklist

- [ ] Sign up for ArangoDB Cloud or provision database
- [ ] Create GCP project and enable billing
- [ ] Install and authenticate Google Cloud SDK
- [ ] Set environment variables
- [ ] Run deployment script
- [ ] Update frontend with backend URL
- [ ] Configure CORS in backend
- [ ] Set up custom domain (optional)
- [ ] Configure monitoring and alerts
- [ ] Set up CI/CD with Cloud Build

---

## CI/CD Setup

Automate deployments on git push:

1. **Connect GitHub/GitLab to Cloud Build**
   ```bash
   gcloud beta builds triggers create github \
     --repo-name=partner-portal \
     --repo-owner=your-github-username \
     --branch-pattern="^main$" \
     --build-config=cloudbuild.yaml
   ```

2. **Set substitution variables in trigger**
   - Go to Cloud Build > Triggers
   - Edit your trigger
   - Add all required substitution variables

3. **Push to main branch**
   - Automatic build and deploy on every push

---

## Database Migration

If moving from local ArangoDB to cloud:

```bash
# Export from local
arangodump --server.database partner_portal --output-directory ./backup

# Import to cloud
arangorestore --server.endpoint <cloud-url> \
  --server.database partner_portal \
  --server.username root \
  --server.password <password> \
  --input-directory ./backup
```

---

## Monitoring and Logs

View logs:
```bash
# Backend logs
gcloud run services logs read partner-portal-backend --region us-central1 --limit 50

# Frontend logs
gcloud run services logs read partner-portal-frontend --region us-central1 --limit 50
```

Monitor in Cloud Console:
- https://console.cloud.google.com/run
- https://console.cloud.google.com/logs

---

## Security Best Practices

1. **Never commit secrets** - Use Secret Manager
2. **Enable authentication** - Remove `--allow-unauthenticated` for production
3. **Use VPC** - Connect services via VPC for internal traffic
4. **Rotate credentials** - Change JWT secrets and database passwords regularly
5. **Enable Cloud Armor** - DDoS protection and WAF
6. **Set up IAM** - Principle of least privilege

---

## Troubleshooting

### Backend can't connect to database
- Check ARANGO_URL is correct
- Verify firewall rules allow Cloud Run IP ranges
- Test connection from Cloud Shell

### Frontend shows API errors
- Check CORS configuration in backend
- Verify backend URL in frontend config
- Check Cloud Run logs for errors

### Cold starts are slow
- Set `--min-instances 1` for critical services
- Optimize container size
- Use Cloud CDN for static assets

---

## Cost Optimization

1. **Use min-instances wisely** - Only for critical paths
2. **Optimize container size** - Smaller images = faster cold starts
3. **Use Cloud CDN** - Cache static frontend assets
4. **Set appropriate memory limits** - Don't over-provision
5. **Use committed use discounts** - For predictable workloads

---

## Support

- Cloud Run docs: https://cloud.google.com/run/docs
- ArangoDB Cloud: https://cloud.arangodb.com/support
- GCP Support: https://cloud.google.com/support
