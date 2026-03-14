import { useState, useEffect, useCallback } from 'react'
import * as accountService from '../services/accountService'

// Hook for fetching a list of accounts with filters
export const useAccounts = (initialFilters = {}) => {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [filters, setFilters] = useState(initialFilters)

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await accountService.getAccounts({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      })

      setAccounts(data.data || [])
      setPagination(prev => ({
        ...prev,
        total: data.total || 0,
        totalPages: data.totalPages || 0
      }))
    } catch (err) {
      setError(err.message)
      console.error('Error fetching accounts:', err)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, filters])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

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
    accounts,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    setPage,
    setLimit,
    refetch: fetchAccounts
  }
}

// Hook for fetching a single account
export const useAccount = (id) => {
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAccount = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)
      const data = await accountService.getAccountById(id)
      setAccount(data)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching account:', err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchAccount()
  }, [fetchAccount])

  return {
    account,
    loading,
    error,
    refetch: fetchAccount
  }
}

// Hook for account mutations (create, update, delete)
export const useAccountMutations = () => {
  const createAccount = async (accountData) => {
    try {
      const result = await accountService.createAccount(accountData)
      return result
    } catch (err) {
      throw new Error(err.message || 'Failed to create account')
    }
  }

  const updateAccount = async (id, accountData) => {
    try {
      const result = await accountService.updateAccount(id, accountData)
      return result
    } catch (err) {
      throw new Error(err.message || 'Failed to update account')
    }
  }

  const deleteAccount = async (id) => {
    try {
      await accountService.deleteAccount(id)
    } catch (err) {
      throw new Error(err.message || 'Failed to delete account')
    }
  }

  const changePassword = async (id, passwordData) => {
    try {
      const result = await accountService.changePassword(id, passwordData)
      return result
    } catch (err) {
      throw new Error(err.message || 'Failed to change password')
    }
  }

  return {
    createAccount,
    updateAccount,
    deleteAccount,
    changePassword
  }
}
