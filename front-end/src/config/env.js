// Environment configuration
// This reads from window.ENV (injected at runtime) or falls back to import.meta.env (build-time)

const getConfig = () => {
  // Runtime config (injected by nginx)
  if (typeof window !== 'undefined' && window.ENV) {
    return {
      apiUrl: window.ENV.VITE_API_URL || 'http://localhost:8081/api',
      environment: window.ENV.VITE_ENVIRONMENT || 'development'
    }
  }
  
  // Build-time config (Vite environment variables)
  return {
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8081/api',
    environment: import.meta.env.VITE_ENVIRONMENT || 'development'
  }
}

export const config = getConfig()

export default config
