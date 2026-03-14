import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useOpportunity, useOpportunityMutations } from '../hooks/useOpportunity'
import { usePartner } from '../hooks/usePartner'
import { VALID_STATUSES, STATUS_CONFIG } from '../config/statuses'

function OpportunityDetail({ mode = 'view' }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const isCreateMode = mode === 'create'
  const { opportunity, loading, error, refetch } = useOpportunity(isCreateMode ? null : id)
  const { updateOpportunity, createOpportunity, loading: mutationLoading } = useOpportunityMutations()
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditMode, setIsEditMode] = useState(isCreateMode)
  const [editedData, setEditedData] = useState(null)

  // Fetch partner data when opportunity is loaded
  const { partner, loading: partnerLoading } = usePartner(opportunity?.partnerId)

  // Status options from config
  const statusOptions = VALID_STATUSES

  // Tabs
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'partner', label: 'Partner' },
    { id: 'customer', label: 'Customer Contact' },
    { id: 'comments', label: 'Comments' },
    { id: 'history', label: 'History' }
  ]

  // Initialize edited data when opportunity loads or in create mode
  useEffect(() => {
    if (isCreateMode) {
      // Initialize empty form for create mode
      setEditedData({
        partnerId: '',
        accountName: '',
        productSkus: [],
        quantity: 1,
        budgetaryAmount: 0,
        customerContact: { name: '', email: '', phone: '' },
        expectedCloseDate: '',
        status: 'requested',
        partnerComment: '',
        vendorComment: ''
      })
    } else if (opportunity) {
      setEditedData({
        partnerId: opportunity.partnerId || '',
        accountName: opportunity.accountName || '',
        productSkus: opportunity.productSkus || [],
        quantity: opportunity.quantity || 1,
        budgetaryAmount: opportunity.budgetaryAmount || 0,
        customerContact: opportunity.customerContact || { name: '', email: '', phone: '' },
        expectedCloseDate: opportunity.expectedCloseDate ? opportunity.expectedCloseDate.split('T')[0] : '',
        status: opportunity.status || 'requested',
        partnerComment: opportunity.partnerComment || '',
        vendorComment: opportunity.vendorComment || ''
      })
    }
  }, [opportunity, isCreateMode])

  if (error) {
    return (
      <Layout>
        <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
          <p style={{ color: 'red' }}>Error: {error}</p>
          <button onClick={() => navigate('/opportunities')} style={{ marginTop: 'var(--space-4)' }}>
            Back to Opportunities
          </button>
        </div>
      </Layout>
    )
  }

  const getStatusStyle = (status) => {
    const config = STATUS_CONFIG[status]
    if (!config) {
      return { bg: '#d1ecf1', text: '#0c5460', border: '#17a2b8' }
    }
    return { 
      bg: config.backgroundColor, 
      text: config.color, 
      border: config.borderColor 
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const handleEditToggle = () => {
    if (isEditMode) {
      // Cancel edit - reset data
      setEditedData({
        partnerId: opportunity.partnerId || '',
        accountName: opportunity.accountName || '',
        productSkus: opportunity.productSkus || [],
        quantity: opportunity.quantity || 1,
        budgetaryAmount: opportunity.budgetaryAmount || 0,
        customerContact: opportunity.customerContact || { name: '', email: '', phone: '' },
        expectedCloseDate: opportunity.expectedCloseDate ? opportunity.expectedCloseDate.split('T')[0] : '',
        status: opportunity.status || 'requested',
        partnerComment: opportunity.partnerComment || '',
        vendorComment: opportunity.vendorComment || ''
      })
    }
    setIsEditMode(!isEditMode)
  }

  const handleSave = async () => {
    try {
      if (isCreateMode) {
        // Create new opportunity
        const result = await createOpportunity(editedData)
        alert('Opportunity created successfully!')
        navigate(`/opportunities/${result._key}`)
      } else {
        // Update existing opportunity
        await updateOpportunity(id, editedData)
        await refetch()
        setIsEditMode(false)
        alert('Opportunity updated successfully!')
      }
    } catch (err) {
      alert(`Error ${isCreateMode ? 'creating' : 'updating'} opportunity: ${err.message}`)
    }
  }

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({ ...prev, [field]: value }))
  }

  const handleContactChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      customerContact: { ...prev.customerContact, [field]: value }
    }))
  }

  // Helper to render field in view or edit mode
  const renderField = (label, value, field, type = 'text') => {
    const fieldValue = isEditMode && editedData ? editedData[field] : value

    return (
      <div>
        <label style={{ 
          display: 'block', 
          fontWeight: 'var(--font-weight-medium)', 
          color: 'var(--gray-700)', 
          marginBottom: 'var(--space-2)',
          fontSize: 'var(--text-sm)'
        }}>
          {label}
        </label>
        {isEditMode ? (
          type === 'select' ? (
            <select
              value={fieldValue || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
              style={{
                width: '100%',
                padding: 'var(--space-2)',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)'
              }}
            >
              {statusOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : type === 'textarea' ? (
            <textarea
              value={fieldValue || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
              rows={4}
              style={{
                width: '100%',
                padding: 'var(--space-2)',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          ) : type === 'number' ? (
            <input
              type="number"
              value={fieldValue || ''}
              onChange={(e) => handleInputChange(field, parseFloat(e.target.value))}
              style={{
                width: '100%',
                padding: 'var(--space-2)',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)'
              }}
            />
          ) : type === 'date' ? (
            <input
              type="date"
              value={fieldValue || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
              style={{
                width: '100%',
                padding: 'var(--space-2)',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)'
              }}
            />
          ) : (
            <input
              type={type}
              value={fieldValue || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
              style={{
                width: '100%',
                padding: 'var(--space-2)',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)'
              }}
            />
          )
        ) : (
          <p style={{ margin: 0, color: 'var(--gray-900)' }}>
            {type === 'date' && value ? formatDate(value) :
             type === 'number' && field === 'budgetaryAmount' ? formatCurrency(value) :
             value || '-'}
          </p>
        )}
      </div>
    )
  }

  // Helper to render contact field
  const renderContactField = (label, value, field) => {
    const contact = isEditMode && editedData ? editedData.customerContact : opportunity?.customerContact || {}
    const displayValue = isEditMode ? contact[field] : value

    return (
      <div>
        <label style={{ display: 'block', fontWeight: 'var(--font-weight-medium)', color: 'var(--gray-700)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>
          {label}
        </label>
        {isEditMode ? (
          <input
            type="text"
            value={displayValue || ''}
            onChange={(e) => handleContactChange(field, e.target.value)}
            style={{
              width: '100%',
              padding: 'var(--space-2)',
              border: '1px solid var(--gray-300)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)'
            }}
          />
        ) : (
          <p style={{ margin: 0, color: 'var(--gray-900)', fontSize: 'var(--text-base)' }}>
            {field === 'email' && value ? (
              <a href={`mailto:${value}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                {value}
              </a>
            ) : field === 'phone' && value ? (
              <a href={`tel:${value}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                {value}
              </a>
            ) : (
              value || '-'
            )}
          </p>
        )}
      </div>
    )
  }

  if (loading && !isCreateMode) {
    return (
      <Layout>
        <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
          <p>Loading opportunity details...</p>
        </div>
      </Layout>
    )
  }

  if (!opportunity && !isCreateMode) {
    return (
      <Layout>
        <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
          <p>Opportunity not found</p>
        </div>
      </Layout>
    )
  }

  const statusStyle = isCreateMode ? getStatusStyle('requested') : getStatusStyle(opportunity.status)

  return (
    <Layout>
      <div style={{ padding: 'var(--space-8)' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 'var(--space-6)'
        }}>
          <div>
            <button
              onClick={() => navigate('/opportunities')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary)',
                cursor: 'pointer',
                fontSize: 'var(--text-sm)',
                padding: '0',
                marginBottom: 'var(--space-2)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}
            >
              ← Back to Opportunities
            </button>
            <h1 style={{ 
              fontSize: 'var(--text-3xl)', 
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--gray-950)',
              margin: '0'
            }}>
              {isCreateMode ? 'Create New Opportunity' : opportunity.accountName}
            </h1>
            {!isCreateMode && (
              <p style={{ 
                color: 'var(--gray-600)', 
                margin: 'var(--space-2) 0 0 0',
                fontSize: 'var(--text-sm)'
              }}>
                Opportunity ID: {opportunity._key}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            {!isCreateMode && (
              <span style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)',
                backgroundColor: statusStyle.bg,
                color: statusStyle.text,
                border: `1px solid ${statusStyle.border}`
              }}>
                {opportunity.status}
              </span>
            )}
            {isEditMode ? (
              <>
                {!isCreateMode && (
                  <button
                    onClick={handleEditToggle}
                    disabled={mutationLoading}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'white',
                      color: 'var(--gray-700)',
                      border: '1px solid var(--gray-300)',
                      borderRadius: 'var(--radius-md)',
                      cursor: mutationLoading ? 'not-allowed' : 'pointer',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)'
                    }}
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={mutationLoading}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: mutationLoading ? 'not-allowed' : 'pointer',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    opacity: mutationLoading ? 0.6 : 1
                  }}
                >
                  {mutationLoading ? 'Saving...' : (isCreateMode ? 'Create Opportunity' : 'Save Changes')}
                </button>
              </>
            ) : (
              !isCreateMode && (
                <button
                  onClick={handleEditToggle}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-medium)'
                  }}
                >
                  Edit Opportunity
                </button>
              )
            )}
          </div>
        </div>

        {/* Tabs */}
        {!isCreateMode && (
          <div style={{
            borderBottom: '1px solid var(--color-border)',
            marginBottom: 'var(--space-6)'
          }}>
            <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '12px 20px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid var(--color-primary)' : '2px solid transparent',
                  color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--gray-600)',
                  cursor: 'pointer',
                  fontSize: 'var(--text-sm)',
                  fontWeight: activeTab === tab.id ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          </div>
        )}

        {/* Tab Content */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: 'var(--space-6)'
        }}>
          {(isCreateMode || activeTab === 'overview') && (
            <div>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-6)' }}>
                {isCreateMode ? 'Opportunity Information' : 'Opportunity Overview'}
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
                {renderField('Account Name', opportunity?.accountName || '', 'accountName')}
                {renderField('Budgetary Amount', opportunity?.budgetaryAmount || 0, 'budgetaryAmount', 'number')}
                {renderField('Quantity', opportunity?.quantity || 1, 'quantity', 'number')}
                {renderField('Expected Close Date', opportunity?.expectedCloseDate || '', 'expectedCloseDate', 'date')}
                {renderField('Status', opportunity?.status || 'requested', 'status', 'select')}
              </div>

              <div style={{ marginBottom: 'var(--space-8)' }}>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-4)', color: 'var(--color-primary)' }}>
                  Product SKUs
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  {editedData?.productSkus && editedData.productSkus.length > 0 ? (
                    editedData.productSkus.map((sku, idx) => (
                      <span key={idx} style={{
                        padding: '8px 16px',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-medium)',
                        border: '1px solid #bfdbfe'
                      }}>
                        {sku}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: 'var(--gray-500)' }}>No products specified</span>
                  )}
                </div>
              </div>

              {!isCreateMode && (
                <div style={{ paddingTop: 'var(--space-6)', borderTop: '1px solid var(--gray-200)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'var(--font-weight-medium)', color: 'var(--gray-700)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>
                        Created
                      </label>
                      <p style={{ margin: 0, color: 'var(--gray-600)', fontSize: 'var(--text-sm)' }}>
                        {formatDate(opportunity.createdAt)}
                      </p>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'var(--font-weight-medium)', color: 'var(--gray-700)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>
                        Last Updated
                      </label>
                      <p style={{ margin: 0, color: 'var(--gray-600)', fontSize: 'var(--text-sm)' }}>
                        {formatDate(opportunity.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'partner' && (
            <div>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-6)' }}>
                Partner Information
              </h2>
              
              {partnerLoading ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--gray-500)' }}>
                  Loading partner information...
                </div>
              ) : partner ? (
                <div>
                  {/* Partner Overview */}
                  <div style={{ 
                    marginBottom: 'var(--space-8)',
                    padding: 'var(--space-6)',
                    backgroundColor: 'var(--gray-50)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--gray-200)'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
                      <div>
                        <label style={{ display: 'block', fontWeight: 'var(--font-weight-medium)', color: 'var(--gray-700)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>
                          Partner ID
                        </label>
                        <p style={{ margin: 0, color: 'var(--gray-900)', fontSize: 'var(--text-base)', fontFamily: 'monospace' }}>
                          {partner._key}
                        </p>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: 'var(--font-weight-medium)', color: 'var(--gray-700)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>
                          Company Name
                        </label>
                        <p style={{ margin: 0, color: 'var(--gray-900)', fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                          {partner.companyName}
                        </p>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: 'var(--font-weight-medium)', color: 'var(--gray-700)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>
                          Country
                        </label>
                        <p style={{ margin: 0, color: 'var(--gray-900)', fontSize: 'var(--text-base)' }}>
                          {partner.country || '-'}
                        </p>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: 'var(--font-weight-medium)', color: 'var(--gray-700)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>
                          Status
                        </label>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 'var(--font-weight-medium)',
                          backgroundColor: 
                            partner.registrationStatus === 'approved' ? '#dcfce7' :
                            partner.registrationStatus === 'pending' ? '#fef3c7' :
                            partner.registrationStatus === 'rejected' ? '#fee2e2' :
                            '#e0e7ff',
                          color:
                            partner.registrationStatus === 'approved' ? '#166534' :
                            partner.registrationStatus === 'pending' ? '#92400e' :
                            partner.registrationStatus === 'rejected' ? '#991b1b' :
                            '#3730a3',
                          border: `1px solid ${
                            partner.registrationStatus === 'approved' ? '#bbf7d0' :
                            partner.registrationStatus === 'pending' ? '#fde68a' :
                            partner.registrationStatus === 'rejected' ? '#fecaca' :
                            '#c7d2fe'
                          }`
                        }}>
                          {partner.registrationStatus || 'pending'}
                        </span>
                      </div>
                    </div>
                    <div style={{ marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => navigate(`/partners/${partner._key}`)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: 'var(--color-primary)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-weight-medium)',
                          transition: 'opacity 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                      >
                        View Full Partner Profile →
                      </button>
                    </div>
                  </div>

                  {/* Partner Contacts */}
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-4)' }}>
                    Partner Contacts
                  </h3>
                  
                  {partner.contacts && partner.contacts.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                      {partner.contacts.map((contact, index) => {
                        const isBusiness = contact.type === 'business'
                        const contactColor = isBusiness ? 'var(--color-primary)' : 'var(--color-secondary)'
                        
                        return (
                          <div key={index}>
                            <h4 style={{ 
                              fontSize: 'var(--text-base)', 
                              fontWeight: 'var(--font-weight-semibold)', 
                              color: contactColor,
                              marginBottom: 'var(--space-3)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 'var(--space-2)',
                              textTransform: 'capitalize'
                            }}>
                              <span style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: contactColor
                              }}></span>
                              {contact.type} Contact
                            </h4>
                            <div style={{ 
                              display: 'grid', 
                              gridTemplateColumns: '1fr 1fr', 
                              gap: 'var(--space-6)',
                              padding: 'var(--space-4)',
                              backgroundColor: 'var(--gray-50)',
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid var(--gray-200)'
                            }}>
                              <div>
                                <label style={{ display: 'block', fontWeight: 'var(--font-weight-medium)', color: 'var(--gray-700)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>
                                  Name
                                </label>
                                <p style={{ margin: 0, color: 'var(--gray-900)', fontSize: 'var(--text-base)' }}>
                                  {contact.firstName} {contact.lastName}
                                </p>
                              </div>
                              <div>
                                <label style={{ display: 'block', fontWeight: 'var(--font-weight-medium)', color: 'var(--gray-700)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>
                                  Job Title
                                </label>
                                <p style={{ margin: 0, color: 'var(--gray-900)', fontSize: 'var(--text-base)' }}>
                                  {contact.jobTitle || '-'}
                                </p>
                              </div>
                              <div>
                                <label style={{ display: 'block', fontWeight: 'var(--font-weight-medium)', color: 'var(--gray-700)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>
                                  Email
                                </label>
                                <p style={{ margin: 0, color: 'var(--gray-900)', fontSize: 'var(--text-base)' }}>
                                  {contact.businessEmail ? (
                                    <a href={`mailto:${contact.businessEmail}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                                      {contact.businessEmail}
                                    </a>
                                  ) : '-'}
                                </p>
                              </div>
                              <div>
                                <label style={{ display: 'block', fontWeight: 'var(--font-weight-medium)', color: 'var(--gray-700)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>
                                  Phone
                                </label>
                                <p style={{ margin: 0, color: 'var(--gray-900)', fontSize: 'var(--text-base)' }}>
                                  {contact.phoneNumber ? (
                                    <a href={`tel:${contact.phoneNumber}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                                      {contact.phoneNumber}
                                    </a>
                                  ) : '-'}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: 'var(--space-8)',
                      color: 'var(--gray-500)',
                      backgroundColor: 'var(--gray-50)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--gray-200)'
                    }}>
                      <p style={{ margin: 0 }}>No contact information available for this partner</p>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: 'var(--space-8)',
                  color: 'var(--gray-500)',
                  backgroundColor: 'var(--gray-50)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--gray-200)'
                }}>
                  <p style={{ margin: 0 }}>Partner information not available</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'customer' && (
            <div>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-6)' }}>
                Customer Contact Information
              </h2>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: 'var(--space-6)',
                padding: 'var(--space-6)',
                backgroundColor: 'var(--gray-50)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--gray-200)'
              }}>
                {renderContactField('Name', opportunity.customerContact?.name, 'name')}
                {renderContactField('Email', opportunity.customerContact?.email, 'email')}
                {renderContactField('Phone', opportunity.customerContact?.phone, 'phone')}
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-6)' }}>
                Comments & Notes
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                <div>
                  <h3 style={{ 
                    fontSize: 'var(--text-lg)', 
                    fontWeight: 'var(--font-weight-semibold)', 
                    color: 'var(--color-primary)',
                    marginBottom: 'var(--space-3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)'
                  }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary)'
                    }}></span>
                    Partner Comment
                  </h3>
                  {renderField('', opportunity.partnerComment, 'partnerComment', 'textarea')}
                </div>
                <div>
                  <h3 style={{ 
                    fontSize: 'var(--text-lg)', 
                    fontWeight: 'var(--font-weight-semibold)', 
                    color: 'var(--color-secondary)',
                    marginBottom: 'var(--space-3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)'
                  }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-secondary)'
                    }}></span>
                    Vendor Comment
                  </h3>
                  {renderField('', opportunity.vendorComment, 'vendorComment', 'textarea')}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-4)' }}>
                Status History
              </h2>
              {opportunity.statusHistory && opportunity.statusHistory.length > 0 ? (
                <div style={{ position: 'relative', paddingLeft: 'var(--space-8)' }}>
                  {/* Timeline line */}
                  <div style={{
                    position: 'absolute',
                    left: '14px',
                    top: '10px',
                    bottom: '10px',
                    width: '2px',
                    backgroundColor: 'var(--gray-200)'
                  }}></div>

                  {/* Timeline entries */}
                  {opportunity.statusHistory.map((entry, index) => {
                    const entryStyle = getStatusStyle(entry.newStatus)
                    return (
                      <div key={index} style={{ 
                        position: 'relative',
                        marginBottom: index < opportunity.statusHistory.length - 1 ? 'var(--space-6)' : '0',
                        paddingBottom: 'var(--space-4)'
                      }}>
                        {/* Timeline dot */}
                        <div style={{
                          position: 'absolute',
                          left: '-31px',
                          top: '4px',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: entryStyle.text,
                          border: '3px solid white',
                          boxShadow: '0 0 0 1px var(--gray-200)',
                          zIndex: 1
                        }}></div>

                        {/* Entry content */}
                        <div style={{
                          backgroundColor: 'var(--gray-50)',
                          borderRadius: 'var(--radius-md)',
                          padding: 'var(--space-4)',
                          border: '1px solid var(--gray-200)'
                        }}>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'flex-start',
                            marginBottom: 'var(--space-2)'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: 'var(--radius-full)',
                                fontSize: 'var(--text-xs)',
                                fontWeight: 'var(--font-weight-medium)',
                                backgroundColor: entryStyle.bg,
                                color: entryStyle.text,
                                border: `1px solid ${entryStyle.border}`
                              }}>
                                {entry.newStatus}
                              </span>
                              {entry.previousStatus && (
                                <>
                                  <span style={{ color: 'var(--gray-400)' }}>←</span>
                                  <span style={{ 
                                    fontSize: 'var(--text-sm)', 
                                    color: 'var(--gray-500)',
                                    textDecoration: 'line-through'
                                  }}>
                                    {entry.previousStatus}
                                  </span>
                                </>
                              )}
                            </div>
                            <time style={{ 
                              fontSize: 'var(--text-sm)', 
                              color: 'var(--gray-500)',
                              whiteSpace: 'nowrap'
                            }}>
                              {formatDate(entry.timestamp)}
                            </time>
                          </div>

                          {entry.comment && (
                            <p style={{
                              margin: 'var(--space-2) 0 0 0',
                              fontSize: 'var(--text-sm)',
                              color: 'var(--gray-700)',
                              backgroundColor: 'white',
                              padding: 'var(--space-2)',
                              borderRadius: 'var(--radius-sm)',
                              borderLeft: '3px solid var(--color-primary)'
                            }}>
                              {entry.comment}
                            </p>
                          )}

                          {entry.changedBy && (
                            <div style={{ 
                              marginTop: 'var(--space-2)',
                              fontSize: 'var(--text-xs)',
                              color: 'var(--gray-500)'
                            }}>
                              Changed by: <span style={{ fontWeight: 'var(--font-weight-medium)' }}>{entry.changedBy}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: 'var(--space-12)',
                  color: 'var(--gray-500)'
                }}>
                  <p style={{ fontSize: 'var(--text-base)', margin: 0 }}>No status history available</p>
                  <p style={{ fontSize: 'var(--text-sm)', margin: 'var(--space-2) 0 0 0' }}>
                    Status changes will appear here once they are made
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default OpportunityDetail
