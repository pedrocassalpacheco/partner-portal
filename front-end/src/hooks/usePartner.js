import { useState, useEffect, useCallback } from 'react'
import * as partnerService from '../services/partnerService'

// Hook for fetching a list of partners with filters
export const usePartners = (initialFilters = {}) => {
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [filters, setFilters] = useState(initialFilters)

  const fetchPartners = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await partnerService.getPartners({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      })

      setPartners(data.data || [])
      setPagination(prev => ({
        ...prev,
        total: data.total || 0,
        totalPages: data.totalPages || 0
      }))
    } catch (err) {
      setError(err.message)
      console.error('Error fetching partners:', err)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, filters])

  useEffect(() => {
    fetchPartners()
  }, [fetchPartners])

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page on filter change
  }

  const setPage = (page) => {
    setPagination(prev => ({ ...prev, page }))
  }

  const setLimit = (limit) => {
    setPagination(prev => ({ ...prev, limit, page: 1 })) // Reset to first page on limit change
  }

  return {
    partners,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    setPage,
    setLimit,
    refetch: fetchPartners
  }
}

// Hook for fetching a single partner
export const usePartner = (id) => {
  const [partner, setPartner] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPartner = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)
      const data = await partnerService.getPartnerById(id)
      setPartner(data)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching partner:', err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchPartner()
  }, [fetchPartner])

  return {
    partner,
    loading,
    error,
    refetch: fetchPartner
  }
}

// Hook for partner mutations (create, update, delete)
export const usePartnerMutations = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createPartner = async (partnerData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await partnerService.createPartner(partnerData)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updatePartner = async (id, partnerData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await partnerService.updatePartner(id, partnerData)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deletePartner = async (id) => {
    try {
      setLoading(true)
      setError(null)
      await partnerService.deletePartner(id)
      return true
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, statusData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await partnerService.updatePartnerStatus(id, statusData)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    createPartner,
    updatePartner,
    deletePartner,
    updateStatus,
    loading,
    error
  }
}
