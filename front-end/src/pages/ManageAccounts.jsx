import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Modal from '../components/Modal'
import { useAccounts, useAccountMutations } from '../hooks/useAccount'
import { usePartners } from '../hooks/usePartner'

function ManageAccounts() {
  const navigate = useNavigate()
  
  // Use custom hooks for account data and operations
  const {
    accounts,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    setPage,
    refetch
  } = useAccounts({
    username: '',
    email: '',
    role: '',
    isActive: ''
  })

  const { createAccount, updateAccount, deleteAccount, changePassword } = useAccountMutations()
  
  // Fetch partners for the partner dropdown
  const { partners } = usePartners({ registrationStatus: 'approved' })

  // Modal states
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    partnerId: '',
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'partner_admin',
    isActive: true,
    password: ''
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleFilterChange = (filterName) => (e) => {
    updateFilters({ [filterName]: e.target.value })
  }

  const handleDelete = async (accountId) => {
    if (!confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      return
    }

    try {
      await deleteAccount(accountId)
      refetch()
    } catch (err) {
      alert('Error deleting account: ' + err.message)
    }
  }

  const handleEdit = (account) => {
    setSelectedAccount(account)
    setIsEditMode(true)
    setFormData({
      partnerId: account.partnerId || '',
      username: account.username || '',
      email: account.email || '',
      firstName: account.firstName || '',
      lastName: account.lastName || '',
      role: account.role || 'partner_admin',
      isActive: account.isActive !== false,
      password: ''
    })
    setShowAccountModal(true)
  }

  const handleCreateNew = () => {
    setSelectedAccount(null)
    setIsEditMode(false)
    setFormData({
      partnerId: '',
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      role: 'partner_admin',
      isActive: true,
      password: ''
    })
    setShowAccountModal(true)
  }

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmitAccount = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.partnerId) {
      alert('Please select a partner')
      return
    }
    if (!formData.username || !formData.email) {
      alert('Username and email are required')
      return
    }
    if (!isEditMode && !formData.password) {
      alert('Password is required for new accounts')
      return
    }

    try {
      if (isEditMode) {
        // Update existing account (without password)
        const updateData = {
          partnerId: formData.partnerId,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
          isActive: formData.isActive
        }
        await updateAccount(selectedAccount._key, updateData)
      } else {
        // Create new account
        await createAccount(formData)
      }
      
      refetch()
      setShowAccountModal(false)
      setFormData({
        partnerId: '',
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        role: 'partner_admin',
        isActive: true,
        password: ''
      })
    } catch (err) {
      alert(`Error ${isEditMode ? 'updating' : 'creating'} account: ` + err.message)
    }
  }

  const handleChangePassword = (account) => {
    setSelectedAccount(account)
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setShowPasswordModal(true)
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmitPassword = async (e) => {
    e.preventDefault()

    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      alert('Please enter and confirm the new password')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters long')
      return
    }

    try {
      await changePassword(selectedAccount._key, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      
      setShowPasswordModal(false)
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      alert('Password changed successfully')
    } catch (err) {
      alert('Error changing password: ' + err.message)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getPartnerName = (partnerId) => {
    const partner = partners.find(p => p._key === partnerId)
    return partner ? partner.companyName : partnerId
  }

  return (
    <Layout>
      <div style={{ marginBottom: 'var(--space-8)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ marginBottom: 'var(--space-4)' }}>Manage Accounts</h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--gray-700)' }}>
            {pagination.total > 0 && `Showing ${((pagination.page - 1) * pagination.limit) + 1}-${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total} accounts`}
            {pagination.total === 0 && 'View and manage partner accounts for portal access.'}
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="btn btn--primary"
          style={{ marginTop: '0' }}
        >
          + Add Account
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--space-4)'
      }}>
        <div>
          <label htmlFor="username" style={{ 
            display: 'block',
            marginBottom: 'var(--space-2)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--gray-700)'
          }}>
            Username
          </label>
          <input
            id="username"
            type="text"
            placeholder="Filter by username..."
            value={filters.username}
            onChange={handleFilterChange('username')}
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
          <label htmlFor="email" style={{ 
            display: 'block',
            marginBottom: 'var(--space-2)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--gray-700)'
          }}>
            Email
          </label>
          <input
            id="email"
            type="text"
            placeholder="Filter by email..."
            value={filters.email}
            onChange={handleFilterChange('email')}
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
          <label htmlFor="role" style={{ 
            display: 'block',
            marginBottom: 'var(--space-2)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--gray-700)'
          }}>
            Role
          </label>
          <select
            id="role"
            value={filters.role}
            onChange={handleFilterChange('role')}
            style={{
              width: '100%',
              padding: 'var(--space-3)',
              border: '1px solid var(--gray-300)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              backgroundColor: 'white'
            }}
          >
            <option value="">All Roles</option>
            <option value="partner_admin">Partner Admin</option>
            <option value="partner_user">Partner User</option>
            <option value="admin">System Admin</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="isActive" style={{ 
            display: 'block',
            marginBottom: 'var(--space-2)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--gray-700)'
          }}>
            Status
          </label>
          <select
            id="isActive"
            value={filters.isActive}
            onChange={handleFilterChange('isActive')}
            style={{
              width: '100%',
              padding: 'var(--space-3)',
              border: '1px solid var(--gray-300)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              backgroundColor: 'white'
            }}
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            onClick={() => {
              updateFilters({
                username: '',
                email: '',
                role: '',
                isActive: ''
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
          <p style={{ color: 'var(--gray-600)' }}>Loading accounts...</p>
        </div>
      )}

      {error && (
        <div className="card" style={{ padding: 'var(--space-6)', backgroundColor: '#fee', borderColor: '#f88' }}>
          <p style={{ color: '#c00', margin: 0 }}>{error}</p>
        </div>
      )}

      {!loading && !error && accounts.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <h3 style={{ color: 'var(--gray-600)', marginBottom: 'var(--space-4)' }}>No Accounts Found</h3>
          <p style={{ color: 'var(--gray-500)' }}>
            {filters.username || filters.email || filters.role || filters.isActive
              ? 'No accounts match your filters. Try adjusting your search criteria.'
              : 'There are no accounts yet. Create one to get started.'}
          </p>
        </div>
      )}

      {!loading && !error && accounts.length > 0 && (
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
                    Username
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
                    Name
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
                    Role
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
                    Last Login
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
                {accounts.map((account, index) => (
                  <tr key={account._key} style={{
                    borderBottom: '1px solid var(--gray-200)',
                    transition: 'background-color 0.15s ease',
                    backgroundColor: index % 2 === 0 ? 'white' : 'var(--gray-50)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--gray-100)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : 'var(--gray-50)'}
                  >
                    <td style={{ 
                      padding: 'var(--space-4)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--gray-950)'
                    }}>
                      {account.username}
                    </td>
                    <td style={{ 
                      padding: 'var(--space-4)',
                      color: 'var(--gray-700)'
                    }}>
                      {account.firstName} {account.lastName}
                    </td>
                    <td style={{ 
                      padding: 'var(--space-4)',
                      color: 'var(--gray-700)'
                    }}>
                      {account.email}
                    </td>
                    <td style={{ 
                      padding: 'var(--space-4)',
                      color: 'var(--gray-700)',
                      fontSize: 'var(--text-sm)'
                    }}>
                      {getPartnerName(account.partnerId)}
                    </td>
                    <td style={{ 
                      padding: 'var(--space-4)'
                    }}>
                      <span style={{
                        fontSize: 'var(--text-xs)',
                        padding: '4px 8px',
                        backgroundColor: 'var(--gray-200)',
                        color: 'var(--gray-700)',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 'var(--font-weight-medium)',
                        textTransform: 'capitalize'
                      }}>
                        {account.role?.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ 
                      padding: 'var(--space-4)'
                    }}>
                      <span style={{
                        fontSize: 'var(--text-xs)',
                        padding: '4px 8px',
                        backgroundColor: account.isActive ? '#d4edda' : '#f8d7da',
                        border: `1px solid ${account.isActive ? '#28a745' : '#dc3545'}`,
                        borderRadius: 'var(--radius-sm)',
                        color: account.isActive ? '#155724' : '#721c24',
                        fontWeight: '500'
                      }}>
                        {account.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ 
                      padding: 'var(--space-4)',
                      color: 'var(--gray-600)',
                      fontSize: 'var(--text-sm)'
                    }}>
                      {account.lastLoginAt ? formatDate(account.lastLoginAt) : 'Never'}
                    </td>
                    <td style={{ 
                      padding: 'var(--space-4)',
                      textAlign: 'right'
                    }}>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleEdit(account)}
                          className="btn btn--secondary btn--sm"
                          style={{
                            padding: '6px 12px',
                            fontSize: 'var(--text-xs)'
                          }}
                          title="Edit account"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleChangePassword(account)}
                          className="btn btn--secondary btn--sm"
                          style={{
                            padding: '6px 12px',
                            fontSize: 'var(--text-xs)'
                          }}
                          title="Change password"
                        >
                          Password
                        </button>
                        <button
                          onClick={() => handleDelete(account._key)}
                          className="btn btn--danger btn--sm"
                          style={{
                            padding: '6px 12px',
                            fontSize: 'var(--text-xs)',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: '1px solid #dc3545'
                          }}
                          title="Delete account"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{
              marginTop: 'var(--space-6)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 'var(--space-2)'
            }}>
              <button
                onClick={() => setPage(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="btn btn--secondary"
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  opacity: pagination.page === 1 ? 0.5 : 1,
                  cursor: pagination.page === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Previous
              </button>
              <span style={{ 
                padding: '0 var(--space-4)',
                color: 'var(--gray-700)'
              }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="btn btn--secondary"
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  opacity: pagination.page === pagination.totalPages ? 0.5 : 1,
                  cursor: pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Account Create/Edit Modal */}
      <Modal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        title={isEditMode ? 'Edit Account' : 'Create New Account'}
      >
        <form onSubmit={handleSubmitAccount}>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label htmlFor="partnerId" style={{ 
              display: 'block',
              marginBottom: 'var(--space-2)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--gray-700)'
            }}>
              Partner *
            </label>
            <select
              id="partnerId"
              name="partnerId"
              value={formData.partnerId}
              onChange={handleFormChange}
              disabled={isEditMode}
              required
              style={{
                width: '100%',
                padding: 'var(--space-3)',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                backgroundColor: isEditMode ? 'var(--gray-100)' : 'white'
              }}
            >
              <option value="">Select a partner...</option>
              {partners.map(partner => (
                <option key={partner._key} value={partner._key}>
                  {partner.companyName}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label htmlFor="username" style={{ 
              display: 'block',
              marginBottom: 'var(--space-2)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--gray-700)'
            }}>
              Username *
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleFormChange}
              disabled={isEditMode}
              required
              style={{
                width: '100%',
                padding: 'var(--space-3)',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                backgroundColor: isEditMode ? 'var(--gray-100)' : 'white'
              }}
            />
            {isEditMode && (
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', marginTop: 'var(--space-1)' }}>
                Username cannot be changed
              </p>
            )}
          </div>

          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label htmlFor="email" style={{ 
              display: 'block',
              marginBottom: 'var(--space-2)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--gray-700)'
            }}>
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleFormChange}
              required
              style={{
                width: '100%',
                padding: 'var(--space-3)',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <div>
              <label htmlFor="firstName" style={{ 
                display: 'block',
                marginBottom: 'var(--space-2)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--gray-700)'
              }}>
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleFormChange}
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
              <label htmlFor="lastName" style={{ 
                display: 'block',
                marginBottom: 'var(--space-2)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--gray-700)'
              }}>
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleFormChange}
                style={{
                  width: '100%',
                  padding: 'var(--space-3)',
                  border: '1px solid var(--gray-300)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label htmlFor="role" style={{ 
              display: 'block',
              marginBottom: 'var(--space-2)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--gray-700)'
            }}>
              Role *
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleFormChange}
              required
              style={{
                width: '100%',
                padding: 'var(--space-3)',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                backgroundColor: 'white'
              }}
            >
              <option value="partner_admin">Partner Admin</option>
              <option value="partner_user">Partner User</option>
              <option value="admin">System Admin</option>
            </select>
          </div>

          {!isEditMode && (
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label htmlFor="password" style={{ 
                display: 'block',
                marginBottom: 'var(--space-2)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--gray-700)'
              }}>
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleFormChange}
                required={!isEditMode}
                minLength={8}
                style={{
                  width: '100%',
                  padding: 'var(--space-3)',
                  border: '1px solid var(--gray-300)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)'
                }}
              />
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', marginTop: 'var(--space-1)' }}>
                Minimum 8 characters
              </p>
            </div>
          )}

          <div style={{ marginBottom: 'var(--space-6)' }}>
            <label style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              fontSize: 'var(--text-sm)',
              color: 'var(--gray-700)',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleFormChange}
                style={{ cursor: 'pointer' }}
              />
              Account is active
            </label>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setShowAccountModal(false)}
              className="btn btn--secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
            >
              {isEditMode ? 'Update Account' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Password Change Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
      >
        <form onSubmit={handleSubmitPassword}>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', marginBottom: 'var(--space-4)' }}>
              Changing password for: <strong>{selectedAccount?.username}</strong>
            </p>
          </div>

          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label htmlFor="currentPassword" style={{ 
              display: 'block',
              marginBottom: 'var(--space-2)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--gray-700)'
            }}>
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              style={{
                width: '100%',
                padding: 'var(--space-3)',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)'
              }}
            />
          </div>

          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label htmlFor="newPassword" style={{ 
              display: 'block',
              marginBottom: 'var(--space-2)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--gray-700)'
            }}>
              New Password *
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
              minLength={8}
              style={{
                width: '100%',
                padding: 'var(--space-3)',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)'
              }}
            />
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', marginTop: 'var(--space-1)' }}>
              Minimum 8 characters
            </p>
          </div>

          <div style={{ marginBottom: 'var(--space-6)' }}>
            <label htmlFor="confirmPassword" style={{ 
              display: 'block',
              marginBottom: 'var(--space-2)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--gray-700)'
            }}>
              Confirm New Password *
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
              minLength={8}
              style={{
                width: '100%',
                padding: 'var(--space-3)',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setShowPasswordModal(false)}
              className="btn btn--secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
            >
              Change Password
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}

export default ManageAccounts
