import { apiRequest } from './api'

/**
 * Get paginated list of opportunities with optional filters
 */
export const getOpportunities = async ({ page = 1, limit = 25, partnerId = '', status = '' } = {}) => {
  const params = new URLSearchParams()
  params.append('page', page)
  params.append('limit', limit)
  if (partnerId) params.append('partnerId', partnerId)
  if (status) params.append('status', status)

  return apiRequest(`/opportunities?${params.toString()}`)
}

/**
 * Get a single opportunity by ID
 */
export const getOpportunityById = async (id) => {
  if (!id) throw new Error('Opportunity ID is required')
  return apiRequest(`/opportunities/${id}`)
}

/**
 * Create a new opportunity
 */
export const createOpportunity = async (opportunityData) => {
  return apiRequest('/opportunities', {
    method: 'POST',
    body: JSON.stringify(opportunityData)
  })
}

/**
 * Update an existing opportunity
 */
export const updateOpportunity = async (id, opportunityData) => {
  if (!id) throw new Error('Opportunity ID is required')
  return apiRequest(`/opportunities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(opportunityData)
  })
}

/**
 * Delete an opportunity
 */
export const deleteOpportunity = async (id) => {
  if (!id) throw new Error('Opportunity ID is required')
  return apiRequest(`/opportunities/${id}`, {
    method: 'DELETE'
  })
}

/**
 * Update opportunity status with history tracking
 */
export const updateOpportunityStatus = async (id, { newStatus, comment, currentOpportunity }) => {
  if (!id) throw new Error('Opportunity ID is required')
  if (!newStatus) throw new Error('New status is required')
  if (!currentOpportunity) throw new Error('Current opportunity data is required')

  const statusHistoryEntry = {
    status: newStatus,
    comment: comment || '',
    timestamp: new Date().toISOString(),
    changedBy: 'admin' // TODO: Get from auth context
  }

  const updatedOpportunity = {
    ...currentOpportunity,
    status: newStatus,
    statusHistory: [...(currentOpportunity.statusHistory || []), statusHistoryEntry]
  }

  return apiRequest(`/opportunities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updatedOpportunity)
  })
}
