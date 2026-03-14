import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Select from 'react-select'
import { useOpportunityMutations } from '../hooks/useOpportunity'
import { VALID_STATUSES, STATUS_CONFIG } from '../config/statuses'
import '../form-styles.css'

function OpportunityRegistration({ isModal = false, onSuccess }) {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  const [formData, setFormData] = useState({
    partnerId: '',
    accountName: '',
    productSkus: [],
    quantity: 1,
    budgetaryAmount: 0,
    customerContact: {
      name: '',
      email: '',
      phone: ''
    },
    expectedCloseDate: '',
    status: 'requested',
    partnerComment: '',
    vendorComment: ''
  })

  const [partnerSearchTerm, setPartnerSearchTerm] = useState('')
  const [partnerOptions, setPartnerOptions] = useState([])
  const [isLoadingPartners, setIsLoadingPartners] = useState(false)
  const [productOptions, setProductOptions] = useState([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setIsLoadingProducts(true)
    try {
      const token = 'any-token'
      const response = await fetch('http://localhost:8081/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const products = await response.json()
        const options = products.map(p => ({
          value: p.sku,
          label: p.name,
          category: p.category
        }))
        setProductOptions(options)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setIsLoadingProducts(false)
    }
  }

  // Search for partners as user types
  const searchPartners = async (searchValue) => {
    if (!searchValue || searchValue.length < 2) {
      setPartnerOptions([])
      return
    }

    setIsLoadingPartners(true)
    try {
      const token = 'any-token'
      const response = await fetch('http://localhost:8081/api/partners', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const partners = await response.json()
        // Filter partners based on search term
        const filtered = partners.filter(p => 
          p.companyName.toLowerCase().includes(searchValue.toLowerCase()) ||
          `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchValue.toLowerCase())
        )
        
        setPartnerOptions(filtered.map(p => ({
          value: p._key,
          label: `${p.companyName} (${p.firstName} ${p.lastName})`,
          partner: p
        })))
      }
    } catch (error) {
      console.error('Error searching partners:', error)
    } finally {
      setIsLoadingPartners(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name.startsWith('customerContact.')) {
      const contactField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        customerContact: {
          ...prev.customerContact,
          [contactField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleMultiSelectChange = (name, selectedOptions) => {
    const values = selectedOptions ? selectedOptions.map(option => option.value) : []
    setFormData(prev => ({
      ...prev,
      [name]: values
    }))
  }

  const handlePartnerSelect = (selectedOption) => {
    if (selectedOption) {
      setFormData(prev => ({
        ...prev,
        partnerId: selectedOption.value
      }))
      setPartnerSearchTerm(selectedOption.label)
    } else {
      setFormData(prev => ({
        ...prev,
        partnerId: ''
      }))
      setPartnerSearchTerm('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      try {
        const token = 'any-token'
        
        // Convert date string to ISO format for backend
        const submitData = {
          ...formData,
          expectedCloseDate: new Date(formData.expectedCloseDate).toISOString(),
          quantity: parseInt(formData.quantity),
          budgetaryAmount: parseFloat(formData.budgetaryAmount)
        }
        
        const response = await fetch('http://localhost:8081/api/opportunities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(submitData)
        })
        
        if (response.ok) {
          alert('Opportunity created successfully!')
          if (isModal && onSuccess) {
            onSuccess()
          } else {
            navigate('/opportunities')
          }
        } else {
          const errorText = await response.text()
          alert(`Failed to create opportunity: ${errorText}`)
        }
      } catch (error) {
        console.error('Error submitting form:', error)
        alert('Error submitting form. Make sure backend is running.')
      }
    }
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const steps = [
    { number: 1, label: 'Account Info' },
    { number: 2, label: 'Products & Budget' },
    { number: 3, label: 'Customer Contact' }
  ]

  const statusOptions = VALID_STATUSES.map(status => ({
    value: status,
    label: STATUS_CONFIG[status].label
  }))

  const renderStepContent = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            <h3 style={{ marginBottom: 'var(--space-6)' }}>Account Information</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <div>
                <label htmlFor="partnerId">
                  Partner <span className="text-accent">*</span>
                </label>
                <Select
                  inputId="partnerId"
                  value={partnerOptions.find(opt => opt.value === formData.partnerId)}
                  onInputChange={(value) => {
                    setPartnerSearchTerm(value)
                    searchPartners(value)
                  }}
                  onChange={handlePartnerSelect}
                  options={partnerOptions}
                  isLoading={isLoadingPartners}
                  placeholder="Start typing partner name..."
                  noOptionsMessage={() => partnerSearchTerm.length < 2 ? 'Type at least 2 characters' : 'No partners found'}
                  isClearable
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: '44px',
                      borderColor: 'var(--gray-300)',
                      '&:hover': { borderColor: 'var(--gray-400)' }
                    })
                  }}
                />
              </div>

              <div>
                <label htmlFor="accountName">
                  Account Name <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  id="accountName"
                  name="accountName"
                  value={formData.accountName}
                  onChange={handleChange}
                  placeholder="e.g., Acme Corporation"
                  required
                />
              </div>

              <div>
                <label htmlFor="status">
                  Status <span className="text-accent">*</span>
                </label>
                <Select
                  inputId="status"
                  value={statusOptions.find(opt => opt.value === formData.status)}
                  onChange={(option) => setFormData(prev => ({ ...prev, status: option.value }))}
                  options={statusOptions}
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: '44px',
                      borderColor: 'var(--gray-300)',
                      '&:hover': { borderColor: 'var(--gray-400)' }
                    })
                  }}
                />
              </div>

              <div>
                <label htmlFor="expectedCloseDate">
                  Expected Close Date <span className="text-accent">*</span>
                </label>
                <input
                  type="date"
                  id="expectedCloseDate"
                  name="expectedCloseDate"
                  value={formData.expectedCloseDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            <h3 style={{ marginBottom: 'var(--space-6)' }}>Products & Budget</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <div>
                <label htmlFor="productSkus">
                  Product SKUs <span className="text-accent">*</span>
                </label>
                <Select
                  inputId="productSkus"
                  isMulti
                  value={productOptions.filter(opt => formData.productSkus.includes(opt.value))}
                  onChange={(selected) => handleMultiSelectChange('productSkus', selected)}
                  options={productOptions}
                  isLoading={isLoadingProducts}
                  placeholder="Select products..."
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: '44px',
                      borderColor: 'var(--gray-300)',
                      '&:hover': { borderColor: 'var(--gray-400)' }
                    })
                  }}
                />
              </div>

              <div>
                <label htmlFor="quantity">
                  Quantity <span className="text-accent">*</span>
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>

              <div>
                <label htmlFor="budgetaryAmount">
                  Budgetary Amount (USD) <span className="text-accent">*</span>
                </label>
                <input
                  type="number"
                  id="budgetaryAmount"
                  name="budgetaryAmount"
                  value={formData.budgetaryAmount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            <h3 style={{ marginBottom: 'var(--space-6)' }}>Customer Contact Information</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <div>
                <label htmlFor="customerContactName">
                  Contact Name <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  id="customerContactName"
                  name="customerContact.name"
                  value={formData.customerContact.name}
                  onChange={handleChange}
                  placeholder="e.g., John Doe"
                  required
                />
              </div>

              <div>
                <label htmlFor="customerContactEmail">
                  Contact Email <span className="text-accent">*</span>
                </label>
                <input
                  type="email"
                  id="customerContactEmail"
                  name="customerContact.email"
                  value={formData.customerContact.email}
                  onChange={handleChange}
                  placeholder="e.g., john.doe@acme.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="customerContactPhone">
                  Contact Phone <span className="text-accent">*</span>
                </label>
                <input
                  type="tel"
                  id="customerContactPhone"
                  name="customerContact.phone"
                  value={formData.customerContact.phone}
                  onChange={handleChange}
                  placeholder="e.g., +1-555-0100"
                  required
                />
              </div>

              <div>
                <label htmlFor="partnerComment">
                  Partner Comment
                </label>
                <textarea
                  id="partnerComment"
                  name="partnerComment"
                  value={formData.partnerComment}
                  onChange={handleChange}
                  placeholder="Add any comments or notes about this opportunity..."
                  rows="4"
                  style={{
                    width: '100%',
                    padding: 'var(--space-3)',
                    border: '1px solid var(--gray-300)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-base)',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label htmlFor="vendorComment">
                  Vendor Comment
                </label>
                <textarea
                  id="vendorComment"
                  name="vendorComment"
                  value={formData.vendorComment}
                  onChange={handleChange}
                  placeholder="Add any vendor-specific comments or internal notes..."
                  rows="4"
                  style={{
                    width: '100%',
                    padding: 'var(--space-3)',
                    border: '1px solid var(--gray-300)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-base)',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const content = (
    <>
      {!isModal && (
        <div style={{ marginBottom: 'var(--space-8)', textAlign: 'center' }}>
          <h1 style={{ marginBottom: 'var(--space-4)' }}>Register Opportunity</h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--gray-700)' }}>
            Create a new sales opportunity for one of your accounts.
          </p>
        </div>
      )}

      <div className="wizard-steps">
        {steps.map((step) => (
          <div
            key={step.number}
            className={`wizard-step ${currentStep === step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}
          >
            <div className="wizard-step-circle">
              {currentStep > step.number ? '✓' : step.number}
            </div>
            <span className="wizard-step-label">{step.label}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="wizard-content">
          {renderStepContent()}
        </div>

        <div className="wizard-actions">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="btn btn--secondary"
            style={{ visibility: currentStep === 1 ? 'hidden' : 'visible' }}
          >
            Previous
          </button>
          
          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn btn--primary"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn--primary"
            >
              Submit Opportunity
            </button>
          )}
        </div>
      </form>
    </>
  )

  if (isModal) {
    return content
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: 'var(--space-6)',
      backgroundColor: 'var(--gray-50)'
    }}>
      <div style={{ 
        maxWidth: '900px',
        width: '100%',
        margin: '0 auto'
      }}>
        {content}
      </div>
    </div>
  )
}

export default OpportunityRegistration
