import { apiRequest } from './api'

// Get list of partners with optional filters and pagination
export const getPartners = async ({ page = 1, limit = 10, companyName, country, partnerType, registrationStatus } = {}) => {
  const params = new URLSearchParams()
  params.append('page', page.toString())
  params.append('limit', limit.toString())
  
  if (companyName) params.append('companyName', companyName)
  if (country) params.append('country', country)
  if (partnerType) params.append('partnerType', partnerType)
  if (registrationStatus) params.append('registrationStatus', registrationStatus)

  return apiRequest(`/partners?${params.toString()}`)
}

// Get a single partner by ID
export const getPartnerById = async (id) => {
  return apiRequest(`/partners/${id}`)
}

// Create a new partner
export const createPartner = async (partnerData) => {
  return apiRequest('/register', {
    method: 'POST',
    body: JSON.stringify(partnerData),
    skipAuth: true // Registration endpoint doesn't require auth
  })
}

// Update an existing partner
export const updatePartner = async (id, partnerData) => {
  return apiRequest(`/partners/${id}`, {
    method: 'PUT',
    body: JSON.stringify(partnerData)
  })
}

// Delete a partner
export const deletePartner = async (id) => {
  return apiRequest(`/partners/${id}`, {
    method: 'DELETE'
  })
}

// Update partner status with history entry
export const updatePartnerStatus = async (id, statusData) => {
  const { newStatus, comment, currentPartner } = statusData
  
  const updatedPartner = {
    ...currentPartner,
    registrationStatus: newStatus,
    statusHistoryEntry: {
      timestamp: new Date().toISOString(),
      previousStatus: currentPartner.registrationStatus || 'pending',
      newStatus: newStatus,
      comment: comment,
      changedBy: 'admin' // TODO: Get from auth context
    }
  }

  return apiRequest(`/partners/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updatedPartner)
  })
}

export default {
  getPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner,
  updatePartnerStatus
}
