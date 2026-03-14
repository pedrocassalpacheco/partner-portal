#!/bin/sh
# Runtime environment variable injection script
# This runs when the container starts and injects environment variables into the frontend

set -e

# Create env-config.js with runtime environment variables
cat <<EOF > /usr/share/nginx/html/env-config.js
window.ENV = {
  VITE_API_URL: "${VITE_API_URL:-http://localhost:8081/api}",
  VITE_ENVIRONMENT: "${VITE_ENVIRONMENT:-production}"
};
EOF

echo "Environment configuration generated:"
cat /usr/share/nginx/html/env-config.js

# Start nginx
exec nginx -g 'daemon off;'
