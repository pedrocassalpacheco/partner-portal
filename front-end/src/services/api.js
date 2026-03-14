import { config } from '../config/env'

// Base API configuration - uses environment-specific URL
const API_BASE_URL = config.apiUrl

// TODO: Replace with actual JWT token from auth context
const getAuthToken = () => {
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiZXhwIjoxNzQxNjM4NjExfQ.6sN_wXqX5pXGZQxYPBqN7qH5yQPJYPZqYPZqYPZqYPY'
}

// Generic API request handler
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  }

  // Add auth token if not a public endpoint
  if (!options.skipAuth) {
    config.headers['Authorization'] = `Bearer ${getAuthToken()}`
  }

  const response = await fetch(url, config)
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `API Error: ${response.status}`)
  }

  return response.json()
}

export default {
  apiRequest,
  API_BASE_URL,
  getAuthToken
}
