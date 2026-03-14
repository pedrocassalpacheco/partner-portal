import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { VALID_STATUSES, STATUS_CONFIG } from '../config/statuses'
import { usePartners, usePartnerMutations } from '../hooks/usePartner'

function ManagePartners() {
  const navigate = useNavigate()
  
  // Use custom hooks for partner data and operations
  const {
    partners,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    setPage,
    setLimit,
    refetch
  } = usePartners({
    companyName: '',
    country: '',
    partnerType: '',
    registrationStatus: ''
  })

  const { deletePartner, updateStatus } = usePartnerMutations()
  
  // Status change dialog state
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [statusComment, setStatusComment] = useState('')

  const handleFilterChange = (filterName) => (e) => {
    updateFilters({ [filterName]: e.target.value })
  }

  const handleDelete = async (partnerId) => {
    if (!confirm('Are you sure you want to delete this partner?')) {
      return
    }

    try {
      await deletePartner(partnerId)
      refetch()
    } catch (err) {
      alert('Error deleting partner: ' + err.message)
    }
  }

  const handlePause = (partnerId) => {
    // TODO: Implement pause/suspend functionality
    console.log('Pausing partner:', partnerId)
    alert('Pause functionality coming soon')
  }

  const handleEdit = (partnerId) => {
    navigate(`/partners/${partnerId}`)
  }

  const handleStatusClick = (partner, status) => {
    setSelectedPartner(partner)
    setNewStatus(status)
    setStatusComment('')
    setShowStatusDialog(true)
  }

  const handleStatusChange = async () => {
    try {
      await updateStatus(selectedPartner._key, {
        newStatus,
        comment: statusComment,
        currentPartner: selectedPartner
      })
      
      refetch()
      setShowStatusDialog(false)
      setSelectedPartner(null)
      setNewStatus('')
      setStatusComment('')
    } catch (err) {
      alert('Error updating partner status: ' + err.message)
    }
  }

  const handleCancelStatusChange = () => {
    setShowStatusDialog(false)
    setSelectedPartner(null)
    setNewStatus('')
    setStatusComment('')
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Layout>
      <div style={{ marginBottom: 'var(--space-8)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ marginBottom: 'var(--space-4)' }}>Manage Partners</h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--gray-700)' }}>
            {pagination.total > 0 && `Showing ${((pagination.page - 1) * pagination.limit) + 1}-${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total} partners`}
            {pagination.total === 0 && 'View and manage all registered partners.'}
          </p>
        </div>
        <button
          onClick={() => navigate('/register')}
          className="btn btn--primary"
          style={{ marginTop: '0' }}
        >
          + Add Partner
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
          <label htmlFor="companyName" style={{ 
            display: 'block',
            marginBottom: 'var(--space-2)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--gray-700)'
          }}>
            Partner Name
          </label>
          <input
            id="companyName"
            type="text"
            placeholder="Filter by partner name..."
            value={filters.companyName}
            onChange={handleFilterChange('companyName')}
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
          <label htmlFor="country" style={{ 
            display: 'block',
            marginBottom: 'var(--space-2)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--gray-700)'
          }}>
            Country
          </label>
          <input
            id="country"
            type="text"
            placeholder="Filter by country..."
            value={filters.country}
            onChange={handleFilterChange('country')}
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
          <label htmlFor="partnerType" style={{ 
            display: 'block',
            marginBottom: 'var(--space-2)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--gray-700)'
          }}>
            Partner Type
          </label>
          <select
            id="partnerType"
            value={filters.partnerType}
            onChange={handleFilterChange('partnerType')}
            style={{
              width: '100%',
              padding: 'var(--space-3)',
              border: '1px solid var(--gray-300)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              backgroundColor: 'white'
            }}
          >
            <option value="">All Types</option>
            <option value="Systems Integrator">Systems Integrator</option>
            <option value="Consulting Partner">Consulting Partner</option>
            <option value="Solution Provider">Solution Provider</option>
            <option value="Technology Partner">Technology Partner</option>
            <option value="ISV (Independent Software Vendor)">ISV</option>
            <option value="Reseller">Reseller</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="registrationStatus" style={{ 
            display: 'block',
            marginBottom: 'var(--space-2)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--gray-700)'
          }}>
            Registration Status
          </label>
          <select
            id="registrationStatus"
            value={filters.registrationStatus}
            onChange={handleFilterChange('registrationStatus')}
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
            {VALID_STATUSES.map(status => (
              <option key={status} value={status}>
                {STATUS_CONFIG[status].label}
              </option>
            ))}
          </select>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            onClick={() => {
              updateFilters({
                companyName: '',
                country: '',
                partnerType: '',
                registrationStatus: ''
              })
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
          <p style={{ color: 'var(--gray-600)' }}>Loading partners...</p>
        </div>
      )}

      {error && (
        <div className="card" style={{ padding: 'var(--space-6)', backgroundColor: '#fee', borderColor: '#f88' }}>
          <p style={{ color: '#c00', margin: 0 }}>{error}</p>
        </div>
      )}

      {!loading && !error && partners.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <h3 style={{ color: 'var(--gray-600)', marginBottom: 'var(--space-4)' }}>No Partners Found</h3>
          <p style={{ color: 'var(--gray-500)' }}>
            {filters.companyName || filters.country || filters.partnerType || filters.registrationStatus
              ? 'No partners match your filters. Try adjusting your search criteria.'
              : 'There are no registered partners yet.'}
          </p>
        </div>
      )}

      {!loading && !error && partners.length > 0 && (
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
                    ID
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
                    Partner
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
                    Contact
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
                    Email
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
                    Country
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
                    Partner Type
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
                    Status
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
                    Registered
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
                {partners.map((partner, index) => (
                  <tr key={partner._key} style={{
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
                      {partner._key}
                    </td>
                    <td style={{ 
                      padding: 'var(--space-4)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--gray-950)'
                    }}>
                      <a 
                        href={`/partners/${partner._key}`}
                        onClick={(e) => {
                          e.preventDefault()
                          navigate(`/partners/${partner._key}`)
                        }}
                        style={{
                          color: 'var(--color-primary)',
                          textDecoration: 'none',
                          borderBottom: '1px solid transparent',
                          transition: 'border-bottom-color 0.2s',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => e.target.style.borderBottomColor = 'var(--color-primary)'}
                        onMouseLeave={(e) => e.target.style.borderBottomColor = 'transparent'}
                      >
                        {partner.companyName}
                      </a>
                    </td>
                    <td style={{ 
                      padding: 'var(--space-4)',
                      color: 'var(--gray-700)'
                    }}>
                      {partner.contacts?.[0]?.firstName} {partner.contacts?.[0]?.lastName}
                    </td>
                    <td style={{ 
                      padding: 'var(--space-4)',
                      color: 'var(--gray-700)'
                    }}>
                      {partner.contacts?.[0]?.businessEmail}
                    </td>
                    <td style={{ 
                      padding: 'var(--space-4)',
                      color: 'var(--gray-700)'
                    }}>
                      {partner.country}
                    </td>
                    <td style={{ 
                      padding: 'var(--space-4)'
                    }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
                        {partner.primaryPartnerBusiness.slice(0, 2).map((type, idx) => (
                          <span key={idx} style={{
                            fontSize: 'var(--text-xs)',
                            padding: '2px 6px',
                            backgroundColor: 'var(--gray-200)',
                            color: 'var(--gray-700)',
                            borderRadius: 'var(--radius-sm)',
                            fontWeight: 'var(--font-weight-medium)',
                            whiteSpace: 'nowrap'
                          }}>
                            {type}
                          </span>
                        ))}
                        {partner.primaryPartnerBusiness.length > 2 && (
                          <span style={{
                            fontSize: 'var(--text-xs)',
                            padding: '2px 6px',
                            color: 'var(--gray-500)',
                            fontWeight: 'var(--font-weight-medium)'
                          }}>
                            +{partner.primaryPartnerBusiness.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ 
                      padding: 'var(--space-4)'
                    }}>
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <button
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect()
                            const dropdown = e.currentTarget.nextElementSibling
                            if (dropdown.style.display === 'block') {
                              dropdown.style.display = 'none'
                            } else {
                              dropdown.style.display = 'block'
                            }
                          }}
                          title={`Change Status (Current: ${STATUS_CONFIG[partner.registrationStatus]?.label || 'N/A'})`}
                          style={{
                            padding: '6px 12px',
                            fontSize: 'var(--text-sm)',
                            backgroundColor: STATUS_CONFIG[partner.registrationStatus]?.backgroundColor || '#d1ecf1',
                            border: `1px solid ${STATUS_CONFIG[partner.registrationStatus]?.borderColor || '#17a2b8'}`,
                            borderRadius: 'var(--radius-sm)',
                            color: STATUS_CONFIG[partner.registrationStatus]?.color || '#0c5460',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontWeight: '500'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '0.8'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '1'
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                            {STATUS_CONFIG[partner.registrationStatus]?.icon === 'check' && (
                              <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
                            )}
                            {STATUS_CONFIG[partner.registrationStatus]?.icon === 'x' && (
                              <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/>
                            )}
                            {(STATUS_CONFIG[partner.registrationStatus]?.icon === 'alert' || !partner.registrationStatus) && (
                              <path d="M8 2a6 6 0 100 12A6 6 0 008 2zM7 7V5h2v2H7zm0 4v-2h2v2H7z"/>
                            )}
                          </svg>
                          <span style={{ fontSize: 'var(--text-xs)', textTransform: 'capitalize' }}>
                            {STATUS_CONFIG[partner.registrationStatus]?.label || partner.registrationStatus || 'N/A'}
                          </span>
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" style={{ marginLeft: '2px' }}>
                            <path d="M4 6l4 4 4-4H4z"/>
                          </svg>
                        </button>
                        <div
                          style={{
                            display: 'none',
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            marginTop: '4px',
                            backgroundColor: 'white',
                            border: '1px solid var(--gray-300)',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            zIndex: 1000,
                            minWidth: '150px'
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {VALID_STATUSES.map((status, index) => {
                            const config = STATUS_CONFIG[status]
                            const iconPath = 
                              config.icon === 'check' ? 'M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z' :
                              config.icon === 'x' ? 'M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z' :
                              'M8 2a6 6 0 100 12A6 6 0 008 2zM7 7V5h2v2H7zm0 4v-2h2v2H7z'
                            
                            return (
                              <button
                                key={status}
                                onClick={() => {
                                  handleStatusClick(partner, status)
                                  const dropdown = document.querySelectorAll('div[style*="display: block"]')
                                  dropdown.forEach(d => d.style.display = 'none')
                                }}
                                style={{
                                  width: '100%',
                                  padding: 'var(--space-3)',
                                  border: 'none',
                                  backgroundColor: 'white',
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                  fontSize: 'var(--text-sm)',
                                  color: config.color,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  borderTop: index > 0 ? '1px solid var(--gray-200)' : 'none'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--gray-50)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                              >
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                  <path d={iconPath}/>
                                </svg>
                                {config.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </td>
                    <td style={{ 
                      padding: 'var(--space-4)',
                      color: 'var(--gray-700)'
                    }}>
                      {formatDate(partner.createdAt)}
                    </td>
                    <td style={{ 
                      padding: 'var(--space-4)',
                      textAlign: 'right'
                    }}>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleEdit(partner._key)}
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
                          onClick={() => handlePause(partner._key)}
                          title="Pause"
                          style={{
                            padding: '6px 10px',
                            fontSize: 'var(--text-base)',
                            backgroundColor: '#fff3cd',
                            border: '1px solid #ffc107',
                            borderRadius: 'var(--radius-sm)',
                            color: '#856404',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#ffe69c'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#fff3cd'
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <rect x="4" y="3" width="3" height="10" rx="1" />
                            <rect x="9" y="3" width="3" height="10" rx="1" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(partner._key)}
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
      {!loading && !error && pagination.totalPages > 1 && (
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
              value={pagination.limit}
              onChange={(e) => setLimit(Number(e.target.value))}
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
              onClick={() => setPage(Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: pagination.page === 1 ? 'var(--gray-100)' : 'white',
                color: pagination.page === 1 ? 'var(--gray-400)' : 'var(--gray-700)',
                cursor: pagination.page === 1 ? 'not-allowed' : 'pointer',
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
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1
                } else if (pagination.page <= 3) {
                  pageNum = i + 1
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i
                } else {
                  pageNum = pagination.page - 2 + i
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    style={{
                      padding: 'var(--space-2) var(--space-3)',
                      border: `1px solid ${pagination.page === pageNum ? 'var(--primary)' : 'var(--gray-300)'}`,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: pagination.page === pageNum ? 'var(--primary)' : 'white',
                      color: pagination.page === pageNum ? 'white' : 'var(--gray-700)',
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
              onClick={() => setPage(Math.min(pagination.totalPages, pagination.page + 1))}
              disabled={pagination.page === pagination.totalPages}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: pagination.page === pagination.totalPages ? 'var(--gray-100)' : 'white',
                color: pagination.page === pagination.totalPages ? 'var(--gray-400)' : 'var(--gray-700)',
                cursor: pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)'
              }}
            >
              Next
            </button>
          </div>

          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>
            Page {pagination.page} of {pagination.totalPages}
          </div>
        </div>
      )}

      {/* Status Change Dialog */}
      {showStatusDialog && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}
          onClick={handleCancelStatusChange}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6)',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ 
              marginTop: 0, 
              marginBottom: 'var(--space-4)',
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--font-weight-semibold)'
            }}>
              Change Partner Status
            </h2>
            
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <p style={{ 
                margin: 0,
                marginBottom: 'var(--space-2)',
                color: 'var(--gray-700)'
              }}>
                <strong>Partner:</strong> {selectedPartner?.companyName}
              </p>
              <p style={{ 
                margin: 0,
                marginBottom: 'var(--space-2)',
                color: 'var(--gray-700)'
              }}>
                <strong>Current Status:</strong>{' '}
                <span style={{ 
                  textTransform: 'capitalize',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: STATUS_CONFIG[selectedPartner?.registrationStatus]?.backgroundColor || '#d1ecf1',
                  color: STATUS_CONFIG[selectedPartner?.registrationStatus]?.color || '#0c5460'
                }}>
                  {STATUS_CONFIG[selectedPartner?.registrationStatus]?.label || selectedPartner?.registrationStatus || 'N/A'}
                </span>
              </p>
              <p style={{ 
                margin: 0,
                color: 'var(--gray-700)'
              }}>
                <strong>New Status:</strong>{' '}
                <span style={{ 
                  textTransform: 'capitalize',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: STATUS_CONFIG[newStatus]?.backgroundColor || '#d1ecf1',
                  color: STATUS_CONFIG[newStatus]?.color || '#0c5460'
                }}>
                  {STATUS_CONFIG[newStatus]?.label || newStatus}
                </span>
              </p>
            </div>

            <div style={{ marginBottom: 'var(--space-6)' }}>
              <label
                htmlFor="statusComment"
                style={{
                  display: 'block',
                  marginBottom: 'var(--space-2)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--gray-700)'
                }}
              >
                Comment (optional)
              </label>
              <textarea
                id="statusComment"
                value={statusComment}
                onChange={(e) => setStatusComment(e.target.value)}
                placeholder="Add a comment about this status change..."
                rows={4}
                style={{
                  width: '100%',
                  padding: 'var(--space-3)',
                  border: '1px solid var(--gray-300)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
              <button
                onClick={handleCancelStatusChange}
                className="btn btn--secondary"
                style={{ margin: 0 }}
              >
                Cancel
              </button>
              <button
                onClick={handleStatusChange}
                className="btn btn--primary"
                style={{ margin: 0 }}
              >
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default ManagePartners
