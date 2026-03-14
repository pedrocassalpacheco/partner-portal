import { useState, useEffect } from 'react'
import { 
  getOpportunities, 
  getOpportunityById, 
  createOpportunity, 
  updateOpportunity, 
  deleteOpportunity,
  updateOpportunityStatus 
} from '../services/opportunityService'

/**
 * Hook for fetching a paginated list of opportunities with filters
 */
export const useOpportunities = (initialFilters = {}) => {
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0
  })
  const [filters, setFilters] = useState(initialFilters)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getOpportunities({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      })
      
      setOpportunities(result.data || [])
      setPagination(prev => ({
        ...prev,
        total: result.total || 0,
        totalPages: result.totalPages || 0
      }))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [pagination.page, pagination.limit, filters.partnerId, filters.status])

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const setPage = (page) => {
    setPagination(prev => ({ ...prev, page }))
  }

  const setLimit = (limit) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }))
  }

  const refetch = () => {
    fetchData()
  }

  return {
    opportunities,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    setPage,
    setLimit,
    refetch
  }
}

/**
 * Hook for fetching a single opportunity by ID
 */
export const useOpportunity = (id) => {
  const [opportunity, setOpportunity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    if (!id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await getOpportunityById(id)
      setOpportunity(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const refetch = () => {
    fetchData()
  }

  return { opportunity, loading, error, refetch }
}

/**
 * Hook for opportunity mutation operations (create, update, delete)
 */
export const useOpportunityMutations = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const create = async (opportunityData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await createOpportunity(opportunityData)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const update = async (id, opportunityData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await updateOpportunity(id, opportunityData)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id) => {
    try {
      setLoading(true)
      setError(null)
      await deleteOpportunity(id)
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, { newStatus, comment, currentOpportunity }) => {
    try {
      setLoading(true)
      setError(null)
      const result = await updateOpportunityStatus(id, { newStatus, comment, currentOpportunity })
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    createOpportunity: create,
    updateOpportunity: update,
    deleteOpportunity: remove,
    updateStatus,
    loading,
    error
  }
}
