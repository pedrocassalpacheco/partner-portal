import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { usePartner, usePartnerMutations } from '../hooks/usePartner'

function PartnerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { partner, loading, error, refetch } = usePartner(id)
  const { updatePartner, loading: mutationLoading } = usePartnerMutations()
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditMode, setIsEditMode] = useState(false)
  const [editedData, setEditedData] = useState(null)

  // Form options
  const numberOfEmployeesOptions = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+']
  const annualRevenueOptions = ['<$1M', '$1M-$5M', '$5M-$10M', '$10M-$50M', '$50M-$100M', '$100M-$500M', '$500M-$1B', '>$1B']
  const primaryPartnerBusinessOptions = ['Systems Integrator', 'Technology Partner', 'Solution Provider', 'Consulting Partner', 'Reseller', 'ISV (Independent Software Vendor)', 'Other']
  const marketFocusOptions = ['Enterprise', 'Mid-Market', 'SMB (Small-Medium Business)', 'Startup', 'Government', 'Education', 'Healthcare', 'Financial Services', 'Retail', 'Manufacturing', 'Technology', 'Other']
  const industryVerticalOptions = ['Financial Services', 'Healthcare & Life Sciences', 'Retail & E-commerce', 'Manufacturing', 'Technology & Software', 'Telecommunications', 'Energy & Utilities', 'Government & Public Sector', 'Education', 'Media & Entertainment', 'Transportation & Logistics', 'Professional Services', 'Other']
  const useCaseOptions = ['Fraud Detection & Analytics', 'Identity & Access Management', 'Knowledge Graph', 'Network & IT Operations', 'Real-Time Recommendations', 'Supply Chain', 'Master Data Management', 'Customer 360', 'Other']

  // Initialize edited data when partner loads
  useEffect(() => {
    if (partner) {
      setEditedData({
        companyName: partner.companyName || '',
        country: partner.country || '',
        primaryPartnerBusiness: partner.primaryPartnerBusiness || [],
        marketFocus: partner.marketFocus || [],
        numberOfEmployees: partner.numberOfEmployees || '',
        annualRevenue: partner.annualRevenue || '',
        useCases: partner.useCases || [],
        graphDatabaseFit: partner.graphDatabaseFit || '',
        industryVerticalFocus: partner.industryVerticalFocus || [],
        keyPartners: partner.keyPartners || '',
        arangoEngagements: partner.arangoEngagements || '',
        trainedStaffMembers: partner.trainedStaffMembers || '',
        aiExperience: partner.aiExperience || '',
        additionalComments: partner.additionalComments || '',
        contacts: partner.contacts || []
      })
    }
  }, [partner])

  // Helper to render contact field
  const renderContactField = (label, value, contactType, field) => {
    const contact = isEditMode && editedData 
      ? editedData.contacts.find(c => c.type === contactType) || {} 
      : value

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
            onChange={(e) => handleContactChange(contactType, field, e.target.value)}
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
            {field === 'businessEmail' && value ? (
              <a href={`mailto:${value}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                {value}
              </a>
            ) : field === 'phoneNumber' && value ? (
              <a href={`tel:${value}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                {value}
              </a>
            ) : field === 'firstName' || field === 'lastName' ? (
              value || ''
            ) : (
              value || '-'
            )}
          </p>
        )}
      </div>
    )
  }

  if (error) {
    return (
      <Layout>
        <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
          <p style={{ color: 'red' }}>Error: {error}</p>
          <button onClick={() => navigate('/partners')} style={{ marginTop: 'var(--space-4)' }}>
            Back to Partners
          </button>
        </div>
      </Layout>
    )
  }

  const getStatusStyle = (status) => {
    const styles = {
      approved: { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
      pending: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
      rejected: { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
      paused: { bg: '#e0e7ff', text: '#3730a3', border: '#c7d2fe' }
    }
    return styles[status] || styles.pending
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'contacts', label: 'Contacts' },
    { id: 'business', label: 'Business Details' },
    { id: 'technical', label: 'Technical Details' },
    { id: 'history', label: 'History' }
  ]

  const handleEditToggle = () => {
    if (isEditMode) {
      // Cancel edit - reset data
      setEditedData({
        companyName: partner.companyName || '',
        country: partner.country || '',
        primaryPartnerBusiness: partner.primaryPartnerBusiness || [],
        marketFocus: partner.marketFocus || [],
        numberOfEmployees: partner.numberOfEmployees || '',
        annualRevenue: partner.annualRevenue || '',
        useCases: partner.useCases || [],
        graphDatabaseFit: partner.graphDatabaseFit || '',
        industryVerticalFocus: partner.industryVerticalFocus || [],
        keyPartners: partner.keyPartners || '',
        arangoEngagements: partner.arangoEngagements || '',
        trainedStaffMembers: partner.trainedStaffMembers || '',
        aiExperience: partner.aiExperience || '',
        additionalComments: partner.additionalComments || '',
        contacts: partner.contacts || []
      })
    }
    setIsEditMode(!isEditMode)
  }

  const handleSave = async () => {
    try {
      await updatePartner(id, editedData)
      await refetch()
      setIsEditMode(false)
      alert('Partner updated successfully!')
    } catch (err) {
      alert('Error updating partner: ' + err.message)
    }
  }

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({ ...prev, [field]: value }))
  }

  const handleContactChange = (contactType, field, value) => {
    setEditedData(prev => {
      const contacts = [...prev.contacts]
      const contactIndex = contacts.findIndex(c => c.type === contactType)
      if (contactIndex >= 0) {
        contacts[contactIndex] = { ...contacts[contactIndex], [field]: value }
      } else {
        contacts.push({ type: contactType, [field]: value })
      }
      return { ...prev, contacts }
    })
  }

  const handleMultiSelectChange = (field, value) => {
    setEditedData(prev => {
      const currentValues = prev[field] || []
      if (currentValues.includes(value)) {
        return { ...prev, [field]: currentValues.filter(v => v !== value) }
      } else {
        return { ...prev, [field]: [...currentValues, value] }
      }
    })
  }

  // Helper to render field in view or edit mode
  const renderField = (label, value, field, type = 'text', options = []) => {
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
              <option value="">Select...</option>
              {options.map(opt => (
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
            {value || '-'}
          </p>
        )}
      </div>
    )
  }

  // Helper to render multi-select field
  const renderMultiSelect = (label, values, field, options) => {
    const fieldValues = isEditMode && editedData ? editedData[field] : values

    return (
      <div style={{ gridColumn: '1 / -1' }}>
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
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: 'var(--space-2)',
            padding: 'var(--space-3)',
            border: '1px solid var(--gray-300)',
            borderRadius: 'var(--radius-md)'
          }}>
            {options.map(option => (
              <label key={option} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={fieldValues?.includes(option) || false}
                  onChange={() => handleMultiSelectChange(field, option)}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ fontSize: 'var(--text-sm)' }}>{option}</span>
              </label>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {values && values.length > 0 ? values.map((item, idx) => (
              <span key={idx} style={{
                padding: '4px 12px',
                backgroundColor: 'var(--gray-100)',
                color: 'var(--gray-700)',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--text-sm)'
              }}>
                {item}
              </span>
            )) : <span style={{ color: 'var(--gray-500)' }}>-</span>}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
          <p>Loading partner details...</p>
        </div>
      </Layout>
    )
  }

  if (!partner) {
    return (
      <Layout>
        <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
          <p>Partner not found</p>
        </div>
      </Layout>
    )
  }

  const statusStyle = getStatusStyle(partner.registrationStatus)
  const businessContact = partner.contacts?.find(c => c.type === 'business')
  const technicalContact = partner.contacts?.find(c => c.type === 'technical')

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
              onClick={() => navigate('/partners')}
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
              ← Back to Partners
            </button>
            <h1 style={{ 
              fontSize: 'var(--text-3xl)', 
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--gray-950)',
              margin: '0'
            }}>
              {partner.companyName}
            </h1>
            <p style={{ 
              color: 'var(--gray-600)', 
              margin: 'var(--space-2) 0 0 0',
              fontSize: 'var(--text-sm)'
            }}>
              Partner ID: {partner._key}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <span style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-medium)',
              backgroundColor: statusStyle.bg,
              color: statusStyle.text,
              border: `1px solid ${statusStyle.border}`
            }}>
              {partner.registrationStatus || 'pending'}
            </span>
            {isEditMode ? (
              <>
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
                  {mutationLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
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
                Edit Partner
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
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

        {/* Tab Content */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: 'var(--space-6)'
        }}>
          {activeTab === 'overview' && (
            <div>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-4)' }}>
                Company Overview
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
                {renderField('Company Name', partner.companyName, 'companyName')}
                {renderField('Country', partner.country, 'country')}
                {renderField('Number of Employees', partner.numberOfEmployees, 'numberOfEmployees', 'select', numberOfEmployeesOptions)}
                {renderField('Annual Revenue', partner.annualRevenue, 'annualRevenue', 'select', annualRevenueOptions)}
                {renderMultiSelect('Primary Partner Business', partner.primaryPartnerBusiness, 'primaryPartnerBusiness', primaryPartnerBusinessOptions)}
                {renderMultiSelect('Market Focus', partner.marketFocus, 'marketFocus', marketFocusOptions)}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontWeight: 'var(--font-weight-medium)', color: 'var(--gray-700)', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                    Registration Date
                  </label>
                  <p style={{ margin: 0, color: 'var(--gray-900)' }}>{formatDate(partner.createdAt)}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contacts' && (
            <div>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-6)' }}>
                Contact Information
              </h2>
              
              {(businessContact || isEditMode) && (
                <div style={{ marginBottom: 'var(--space-8)' }}>
                  <h3 style={{ 
                    fontSize: 'var(--text-lg)', 
                    fontWeight: 'var(--font-weight-semibold)', 
                    color: 'var(--color-primary)',
                    marginBottom: 'var(--space-4)',
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
                    Business Contact
                  </h3>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: 'var(--space-6)',
                    padding: 'var(--space-4)',
                    backgroundColor: 'var(--gray-50)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    {isEditMode ? (
                      <>
                        {renderContactField('First Name', businessContact?.firstName, 'business', 'firstName')}
                        {renderContactField('Last Name', businessContact?.lastName, 'business', 'lastName')}
                      </>
                    ) : (
                      <div>
                        <label style={{ display: 'block', fontWeight: 'var(--font-weight-medium)', color: 'var(--gray-700)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>
                          Name
                        </label>
                        <p style={{ margin: 0, color: 'var(--gray-900)', fontSize: 'var(--text-base)' }}>
                          {businessContact?.firstName} {businessContact?.lastName}
                        </p>
                      </div>
                    )}
                    {renderContactField('Job Title', businessContact?.jobTitle, 'business', 'jobTitle')}
                    {renderContactField('Email', businessContact?.businessEmail, 'business', 'businessEmail')}
                    {renderContactField('Phone', businessContact?.phoneNumber, 'business', 'phoneNumber')}
                  </div>
                </div>
              )}

              {(technicalContact || isEditMode) && (
                <div>
                  <h3 style={{ 
                    fontSize: 'var(--text-lg)', 
                    fontWeight: 'var(--font-weight-semibold)', 
                    color: 'var(--color-secondary)',
                    marginBottom: 'var(--space-4)',
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
                    Technical Contact
                  </h3>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: 'var(--space-6)',
                    padding: 'var(--space-4)',
                    backgroundColor: 'var(--gray-50)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    {isEditMode ? (
                      <>
                        {renderContactField('First Name', technicalContact?.firstName, 'technical', 'firstName')}
                        {renderContactField('Last Name', technicalContact?.lastName, 'technical', 'lastName')}
                      </>
                    ) : (
                      <div>
                        <label style={{ display: 'block', fontWeight: 'var(--font-weight-medium)', color: 'var(--gray-700)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>
                          Name
                        </label>
                        <p style={{ margin: 0, color: 'var(--gray-900)', fontSize: 'var(--text-base)' }}>
                          {technicalContact?.firstName} {technicalContact?.lastName}
                        </p>
                      </div>
                    )}
                    {renderContactField('Job Title', technicalContact?.jobTitle, 'technical', 'jobTitle')}
                    {renderContactField('Email', technicalContact?.businessEmail, 'technical', 'businessEmail')}
                    {renderContactField('Phone', technicalContact?.phoneNumber, 'technical', 'phoneNumber')}
                  </div>
                </div>
              )}

              {!businessContact && !technicalContact && !isEditMode && (
                <p style={{ color: 'var(--gray-500)', textAlign: 'center', padding: 'var(--space-8)' }}>
                  No contact information available
                </p>
              )}
            </div>
          )}

          {activeTab === 'business' && (
            <div>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-4)' }}>
                Business Details
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                {renderMultiSelect('Use Cases', partner.useCases, 'useCases', useCaseOptions)}
                {renderMultiSelect('Industry Vertical Focus', partner.industryVerticalFocus, 'industryVerticalFocus', industryVerticalOptions)}
                {renderField('Graph Database Fit', partner.graphDatabaseFit, 'graphDatabaseFit', 'textarea')}
                {renderField('Key Partners', partner.keyPartners, 'keyPartners', 'textarea')}
                {renderField('Additional Comments', partner.additionalComments, 'additionalComments', 'textarea')}
              </div>
            </div>
          )}

          {activeTab === 'technical' && (
            <div>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-4)' }}>
                Technical Capabilities
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
                {renderField('Arango Engagements', partner.arangoEngagements, 'arangoEngagements')}
                {renderField('Trained Staff Members', partner.trainedStaffMembers, 'trainedStaffMembers')}
                {renderField('AI Experience (months)', partner.aiExperience, 'aiExperience')}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-4)' }}>
                Status History
              </h2>
              {partner.statusHistory && partner.statusHistory.length > 0 ? (
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
                  {partner.statusHistory.map((entry, index) => {
                    const entryStyle = getStatusStyle(entry.newStatus)
                    return (
                      <div key={index} style={{ 
                        position: 'relative',
                        marginBottom: index < partner.statusHistory.length - 1 ? 'var(--space-6)' : '0',
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

export default PartnerDetail
