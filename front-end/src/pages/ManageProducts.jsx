import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'

function ManageProducts() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Pagination state
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  
  // Filter state
  const [nameFilter, setNameFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Build query params
      const params = new URLSearchParams()
      params.append('page', page)
      params.append('limit', limit)
      if (nameFilter) params.append('name', nameFilter)
      if (categoryFilter) params.append('category', categoryFilter)
      if (statusFilter) params.append('isActive', statusFilter)
      
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiZXhwIjoxNzQxNjM4NjExfQ.6sN_wXqX5pXGZQxYPBqN7qH5yQPJYPZqYPZqYPZqYPY'
      
      const response = await fetch(`http://localhost:8081/api/products?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        // Handle both array response (old API) and paginated response (new API)
        if (Array.isArray(result)) {
          setProducts(result)
          setTotal(result.length)
          setTotalPages(1)
        } else {
          setProducts(result.data || [])
          setTotal(result.total || 0)
          setTotalPages(result.totalPages || 0)
        }
      } else {
        const errorText = await response.text()
        setError(`Failed to load products: ${errorText}`)
      }
    } catch (err) {
      setError('Error loading products: ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [page, limit, nameFilter, categoryFilter, statusFilter])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])
  
  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value)
    setPage(1) // Reset to first page when filter changes
  }

  const handleEdit = (productId) => {
    navigate(`/products/edit/${productId}`)
  }

  const handleToggleActive = async (productId, currentStatus) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this product?`)) {
      return
    }

    try {
      const product = products.find(p => p._key === productId)
      if (!product) return

      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiZXhwIjoxNzQxNjM4NjExfQ.6sN_wXqX5pXGZQxYPBqN7qH5yQPJYPZqYPZqYPZqYPY'
      
      const response = await fetch(`http://localhost:8081/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sku: product.sku,
          name: product.name,
          category: product.category,
          description: product.description,
          isActive: !currentStatus
        })
      })
      
      if (response.ok) {
        // Update local state
        setProducts(products.map(p => 
          p._key === productId ? { ...p, isActive: !currentStatus } : p
        ))
      } else {
        alert('Failed to update product status')
      }
    } catch (err) {
      alert('Error updating product: ' + err.message)
    }
  }

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiZXhwIjoxNzQxNjM4NjExfQ.6sN_wXqX5pXGZQxYPBqN7qH5yQPJYPZqYPZqYPZqYPY'
      
      const response = await fetch(`http://localhost:8081/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        setProducts(products.filter(p => p._key !== productId))
      } else {
        alert('Failed to delete product')
      }
    } catch (err) {
      alert('Error deleting product: ' + err.message)
    }
  }

  return (
    <Layout>
      <div style={{ marginBottom: 'var(--space-8)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ marginBottom: 'var(--space-4)' }}>Manage Products</h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--gray-700)' }}>
            {total > 0 && `Showing ${((page - 1) * limit) + 1}-${Math.min(page * limit, total)} of ${total} products`}
            {total === 0 && 'View and manage all products.'}
          </p>
        </div>
        <button
          onClick={() => navigate('/products/register')}
          className="btn btn--primary"
          style={{ marginTop: '0' }}
        >
          + Add Product
        </button>
      </div>

      {/* Filters */}
      <div style={{
        marginBottom: 'var(--space-6)',
        padding: 'var(--space-6)',
        backgroundColor: 'white',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--gray-200)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 'var(--space-4)'
      }}>
        <div>
          <label htmlFor="name" style={{ 
            display: 'block',
            marginBottom: 'var(--space-2)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--gray-700)'
          }}>
            Product Name / SKU
          </label>
          <input
            id="name"
            type="text"
            placeholder="Filter by name or SKU..."
            value={nameFilter}
            onChange={handleFilterChange(setNameFilter)}
            style={{
              width: '100%',
              padding: 'var(--space-3)',
              border: '1px solid var(--gray-300)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)'
            }}
          />
        </div>
        
        <div>
          <label htmlFor="category" style={{ 
            display: 'block',
            marginBottom: 'var(--space-2)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--gray-700)'
          }}>
            Category
          </label>
          <select
            id="category"
            value={categoryFilter}
            onChange={handleFilterChange(setCategoryFilter)}
            style={{
              width: '100%',
              padding: 'var(--space-3)',
              border: '1px solid var(--gray-300)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              backgroundColor: 'white'
            }}
          >
            <option value="">All Categories</option>
            <option value="Customer Deployed">Customer Deployed</option>
            <option value="Managed Cloud Services">Managed Cloud Services</option>
            <option value="Professional Services">Professional Services</option>
            <option value="Training & Certification">Training & Certification</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="status" style={{ 
            display: 'block',
            marginBottom: 'var(--space-2)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--gray-700)'
          }}>
            Status
          </label>
          <select
            id="status"
            value={statusFilter}
            onChange={handleFilterChange(setStatusFilter)}
            style={{
              width: '100%',
              padding: 'var(--space-3)',
              border: '1px solid var(--gray-300)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              backgroundColor: 'white'
            }}
          >
            <option value="">All Statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            onClick={() => {
              setNameFilter('')
              setCategoryFilter('')
              setStatusFilter('')
              setPage(1)
            }}
            className="btn btn--secondary"
            style={{ width: '100%' }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <p style={{ color: 'var(--gray-600)' }}>Loading products...</p>
        </div>
      )}

      {error && (
        <div className="card" style={{ padding: 'var(--space-6)', backgroundColor: '#fee', borderColor: '#f88' }}>
          <p style={{ color: '#c00', margin: 0 }}>{error}</p>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <h3 style={{ color: 'var(--gray-600)', marginBottom: 'var(--space-4)' }}>No Products Found</h3>
          <p style={{ color: 'var(--gray-500)' }}>
            {nameFilter || categoryFilter || statusFilter
              ? 'No products match your filters. Try adjusting your search criteria.'
              : 'There are no products in the catalog yet.'}
          </p>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div style={{ marginTop: 'var(--space-6)' }}>
          <div style={{ 
            overflowX: 'auto',
            backgroundColor: 'white',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--gray-200)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 'var(--text-sm)'
            }}>
              <thead>
                <tr style={{ 
                  backgroundColor: 'var(--gray-50)',
                  borderBottom: '2px solid var(--gray-200)'
                }}>
                  <th style={{
                    padding: 'var(--space-4)',
                    textAlign: 'left',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--gray-700)',
                    fontSize: 'var(--text-xs)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    SKU
                  </th>
                  <th style={{
                    padding: 'var(--space-4)',
                    textAlign: 'left',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--gray-700)',
                    fontSize: 'var(--text-xs)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Product Name
                  </th>
                  <th style={{
                    padding: 'var(--space-4)',
                    textAlign: 'left',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--gray-700)',
                    fontSize: 'var(--text-xs)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Category
                  </th>
                  <th style={{
                    padding: 'var(--space-4)',
                    textAlign: 'left',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--gray-700)',
                    fontSize: 'var(--text-xs)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Description
                  </th>
                  <th style={{
                    padding: 'var(--space-4)',
                    textAlign: 'center',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--gray-700)',
                    fontSize: 'var(--text-xs)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Status
                  </th>
                  <th style={{
                    padding: 'var(--space-4)',
                    textAlign: 'right',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--gray-700)',
                    fontSize: 'var(--text-xs)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={product._key} style={{
                    borderBottom: '1px solid var(--gray-200)',
                    transition: 'background-color 0.15s ease',
                    backgroundColor: index % 2 === 0 ? 'white' : 'var(--gray-50)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--gray-100)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : 'var(--gray-50)'}
                  >
                    <td style={{ 
                      padding: 'var(--space-4)',
                      color: 'var(--gray-600)',
                      fontFamily: 'monospace',
                      fontSize: 'var(--text-xs)'
                    }}>
                      {product.sku}
                    </td>
                    <td style={{ 
                      padding: 'var(--space-4)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--gray-950)'
                    }}>
                      {product.name}
                    </td>
                    <td style={{ 
                      padding: 'var(--space-4)'
                    }}>
                      <span style={{
                        fontSize: 'var(--text-xs)',
                        padding: '4px 8px',
                        backgroundColor: 'var(--gray-200)',
                        color: 'var(--gray-700)',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 'var(--font-weight-medium)',
                        whiteSpace: 'nowrap'
                      }}>
                        {product.category}
                      </span>
                    </td>
                    <td style={{ 
                      padding: 'var(--space-4)',
                      color: 'var(--gray-700)',
                      maxWidth: '400px'
                    }}>
                      {product.description}
                    </td>
                    <td style={{ 
                      padding: 'var(--space-4)',
                      textAlign: 'center'
                    }}>
                      <span style={{
                        fontSize: 'var(--text-xs)',
                        padding: '4px 8px',
                        backgroundColor: product.isActive ? '#d1fae5' : '#fee2e2',
                        color: product.isActive ? '#065f46' : '#991b1b',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 'var(--font-weight-medium)'
                      }}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ 
                      padding: 'var(--space-4)',
                      textAlign: 'right'
                    }}>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleEdit(product._key)}
                          title="Edit"
                          style={{
                            padding: '6px 10px',
                            fontSize: 'var(--text-base)',
                            backgroundColor: 'white',
                            border: '1px solid var(--gray-300)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--gray-700)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--gray-50)'
                            e.currentTarget.style.borderColor = 'var(--gray-400)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'white'
                            e.currentTarget.style.borderColor = 'var(--gray-300)'
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 2L14 5L5 14H2V11L11 2Z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleToggleActive(product._key, product.isActive)}
                          title={product.isActive ? 'Deactivate' : 'Activate'}
                          style={{
                            padding: '6px 10px',
                            fontSize: 'var(--text-base)',
                            backgroundColor: product.isActive ? '#fff3cd' : '#d1fae5',
                            border: `1px solid ${product.isActive ? '#ffc107' : '#10b981'}`,
                            borderRadius: 'var(--radius-sm)',
                            color: product.isActive ? '#856404' : '#065f46',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = product.isActive ? '#ffe69c' : '#a7f3d0'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = product.isActive ? '#fff3cd' : '#d1fae5'
                          }}
                        >
                          {product.isActive ? (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                              <rect x="4" y="3" width="3" height="10" rx="1" />
                              <rect x="9" y="3" width="3" height="10" rx="1" />
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M4 3L12 8L4 13Z" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(product._key)}
                          title="Delete"
                          style={{
                            padding: '6px 10px',
                            fontSize: 'var(--text-base)',
                            backgroundColor: '#dc3545',
                            border: '1px solid #dc3545',
                            borderRadius: 'var(--radius-sm)',
                            color: 'white',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#c82333'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#dc3545'
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 4H13" />
                            <path d="M5 4V3C5 2.5 5.5 2 6 2H10C10.5 2 11 2.5 11 3V4" />
                            <path d="M6 7V12" />
                            <path d="M10 7V12" />
                            <path d="M4 4L5 14H11L12 4" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && !error && totalPages > 1 && (
        <div style={{
          marginTop: 'var(--space-6)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--space-4)',
          backgroundColor: 'white',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--gray-200)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <label htmlFor="pageSize" style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>
              Per page:
            </label>
            <select
              id="pageSize"
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value))
                setPage(1)
              }}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                backgroundColor: 'white'
              }}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: page === 1 ? 'var(--gray-100)' : 'white',
                color: page === 1 ? 'var(--gray-400)' : 'var(--gray-700)',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)'
              }}
            >
              Previous
            </button>

            <div style={{ 
              display: 'flex', 
              gap: 'var(--space-1)',
              alignItems: 'center'
            }}>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (page <= 3) {
                  pageNum = i + 1
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = page - 2 + i
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    style={{
                      padding: 'var(--space-2) var(--space-3)',
                      border: `1px solid ${page === pageNum ? 'var(--primary)' : 'var(--gray-300)'}`,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: page === pageNum ? 'var(--primary)' : 'white',
                      color: page === pageNum ? 'white' : 'var(--gray-700)',
                      cursor: 'pointer',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      minWidth: '32px'
                    }}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: page === totalPages ? 'var(--gray-100)' : 'white',
                color: page === totalPages ? 'var(--gray-400)' : 'var(--gray-700)',
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)'
              }}
            >
              Next
            </button>
          </div>

          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>
            Page {page} of {totalPages}
          </div>
        </div>
      )}
    </Layout>
  )
}

export default ManageProducts
