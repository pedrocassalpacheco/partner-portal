import { apiRequest } from './api'

// Get list of accounts with optional filters and pagination
export const getAccounts = async ({ page = 1, limit = 10, username, email, role, isActive } = {}) => {
  const params = new URLSearchParams()
  params.append('page', page.toString())
  params.append('limit', limit.toString())
  
  if (username) params.append('username', username)
  if (email) params.append('email', email)
  if (role) params.append('role', role)
  if (isActive !== undefined) params.append('isActive', isActive)

  return apiRequest(`/accounts?${params.toString()}`)
}

// Get a single account by ID
export const getAccountById = async (id) => {
  return apiRequest(`/accounts/${id}`)
}

// Create a new account
export const createAccount = async (accountData) => {
  return apiRequest('/accounts', {
    method: 'POST',
    body: JSON.stringify(accountData)
  })
}

// Update an existing account
export const updateAccount = async (id, accountData) => {
  return apiRequest(`/accounts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(accountData)
  })
}

// Delete an account
export const deleteAccount = async (id) => {
  return apiRequest(`/accounts/${id}`, {
    method: 'DELETE'
  })
}

// Change password for an account
export const changePassword = async (id, passwordData) => {
  return apiRequest(`/accounts/${id}/change-password`, {
    method: 'POST',
    body: JSON.stringify(passwordData)
  })
}

// Login with credentials
export const login = async (credentials) => {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
    skipAuth: true
  })
}
