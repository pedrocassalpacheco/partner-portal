import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Select from 'react-select'
import { usePartner, usePartnerMutations } from '../hooks/usePartner'
import '../form-styles.css'

function PartnerRegistration({ mode = 'create', isModal = false, onSuccess }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3
  
  const { partner, loading: fetchLoading } = usePartner(mode === 'edit' ? id : null)
  const { createPartner, updatePartner, loading: mutationLoading } = usePartnerMutations()
  
  const [formData, setFormData] = useState({
    companyName: '',
    contacts: [
      {
        type: 'business',
        firstName: '',
        lastName: '',
        jobTitle: '',
        businessEmail: '',
        phoneNumber: ''
      },
      {
        type: 'technical',
        firstName: '',
        lastName: '',
        jobTitle: '',
        businessEmail: '',
        phoneNumber: ''
      }
    ],
    country: '',
    primaryPartnerBusiness: [],
    marketFocus: [],
    numberOfEmployees: '',
    annualRevenue: '',
    useCases: [],
    graphDatabaseFit: '',
    industryVerticalFocus: [],
    keyPartners: '',
    arangoEngagements: '',
    trainedStaffMembers: '',
    aiExperience: '',
    additionalComments: ''
  })

  // Populate form when partner data is loaded in edit mode
  useEffect(() => {
    if (partner && mode === 'edit') {
      // Ensure contacts array has both business and technical contacts
      const contacts = partner.contacts || []
      const businessContact = contacts.find(c => c.type === 'business') || {
        type: 'business',
        firstName: '',
        lastName: '',
        jobTitle: '',
        businessEmail: '',
        phoneNumber: ''
      }
      const technicalContact = contacts.find(c => c.type === 'technical') || {
        type: 'technical',
        firstName: '',
        lastName: '',
        jobTitle: '',
        businessEmail: '',
        phoneNumber: ''
      }
      
      setFormData({
        companyName: partner.companyName || '',
        contacts: [businessContact, technicalContact],
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
        additionalComments: partner.additionalComments || ''
      })
    }
  }, [partner, mode])

  const handleChange = (e) => {
    const { name, value, type, checked, options, multiple } = e.target
    
    if (type === 'checkbox') {
      // Handle multi-select checkboxes for useCases
      setFormData(prev => {
        const currentValues = prev[name] || []
        if (checked) {
          return { ...prev, [name]: [...currentValues, value] }
        } else {
          return { ...prev, [name]: currentValues.filter(v => v !== value) }
        }
      })
    } else if (multiple) {
      // Handle multi-select dropdowns
      const selectedValues = Array.from(options)
        .filter(option => option.selected)
        .map(option => option.value)
      setFormData(prev => ({
        ...prev,
        [name]: selectedValues
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  // Handle react-select multi-select changes
  const handleMultiSelectChange = (name, selectedOptions) => {
    const values = selectedOptions ? selectedOptions.map(option => option.value) : []
    setFormData(prev => ({
      ...prev,
      [name]: values
    }))
  }

  // Handle contact field changes
  const handleContactChange = (contactType, field, value) => {
    setFormData(prev => {
      const contacts = [...prev.contacts]
      const contactIndex = contacts.findIndex(c => c.type === contactType)
      if (contactIndex !== -1) {
        contacts[contactIndex] = {
          ...contacts[contactIndex],
          [field]: value
        }
      }
      return {
        ...prev,
        contacts
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      try {
        let result
        if (mode === 'edit') {
          result = await updatePartner(id, formData)
        } else {
          result = await createPartner(formData)
        }
        
        const message = mode === 'edit' 
          ? 'Partner updated successfully!'
          : 'Registration submitted successfully!'
        alert(message)
        console.log('Form submitted:', formData)
        
        if (isModal && onSuccess) {
          onSuccess()
        } else {
          navigate('/partners')
        }
      } catch (error) {
        console.error('Error submitting form:', error)
        alert(`Error ${mode === 'edit' ? 'updating' : 'submitting'} form: ${error.message}`)
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
    { number: 1, label: 'Contact Info' },
    { number: 2, label: 'Company Details' },
    { number: 3, label: 'Partnership Info' }
  ]

  const useCaseOptions = [
    'Fraud Detection & Analytics',
    'Identity & Access Management',
    'Knowledge Graph',
    'Network & IT Operations',
    'Real-Time Recommendations',
    'Supply Chain',
    'Master Data Management',
    'Customer 360',
    'Other'
  ]

  const primaryPartnerBusinessOptions = [
    'Systems Integrator',
    'Technology Partner',
    'Solution Provider',
    'Consulting Partner',
    'Reseller',
    'ISV (Independent Software Vendor)',
    'Other'
  ]

  const marketFocusOptions = [
    'Enterprise',
    'Mid-Market',
    'SMB (Small-Medium Business)',
    'Startup',
    'Government',
    'Education',
    'Healthcare',
    'Financial Services',
    'Retail',
    'Manufacturing',
    'Technology',
    'Other'
  ]

  const industryVerticalOptions = [
    'Financial Services',
    'Healthcare & Life Sciences',
    'Retail & E-commerce',
    'Manufacturing',
    'Technology & Software',
    'Telecommunications',
    'Energy & Utilities',
    'Government & Public Sector',
    'Education',
    'Media & Entertainment',
    'Transportation & Logistics',
    'Professional Services',
    'Other'
  ]

  const renderStepContent = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            <h3 style={{ marginBottom: 'var(--space-6)' }}>Contact Information</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <div>
                <label htmlFor="companyName">
                  Company Name <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Business Contact Section */}
              <div style={{ marginTop: 'var(--space-4)' }}>
                <h4 style={{ 
                  marginBottom: 'var(--space-4)', 
                  color: 'var(--color-primary)',
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-weight-semibold)',
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
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
                    <div>
                      <label htmlFor="businessFirstName">
                        First Name <span className="text-accent">*</span>
                      </label>
                      <input
                        type="text"
                        id="businessFirstName"
                        name="businessFirstName"
                        value={formData.contacts[0].firstName}
                        onChange={(e) => handleContactChange('business', 'firstName', e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="businessLastName">
                        Last Name <span className="text-accent">*</span>
                      </label>
                      <input
                        type="text"
                        id="businessLastName"
                        name="businessLastName"
                        value={formData.contacts[0].lastName}
                        onChange={(e) => handleContactChange('business', 'lastName', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="businessJobTitle">
                      Job Title <span className="text-accent">*</span>
                    </label>
                    <input
                      type="text"
                      id="businessJobTitle"
                      name="businessJobTitle"
                      value={formData.contacts[0].jobTitle}
                      onChange={(e) => handleContactChange('business', 'jobTitle', e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
                    <div>
                      <label htmlFor="businessEmail">
                        Business Email <span className="text-accent">*</span>
                      </label>
                      <input
                        type="email"
                        id="businessEmail"
                        name="businessEmail"
                        value={formData.contacts[0].businessEmail}
                        onChange={(e) => handleContactChange('business', 'businessEmail', e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="businessPhoneNumber">
                        Phone Number <span className="text-accent">*</span>
                      </label>
                      <input
                        type="tel"
                        id="businessPhoneNumber"
                        name="businessPhoneNumber"
                        value={formData.contacts[0].phoneNumber}
                        onChange={(e) => handleContactChange('business', 'phoneNumber', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Contact Section */}
              <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--color-border)' }}>
                <h4 style={{ 
                  marginBottom: 'var(--space-4)', 
                  color: 'var(--color-secondary)',
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-weight-semibold)',
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
                  Technical Contact <span style={{ fontWeight: 'var(--font-weight-normal)', fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>(Optional)</span>
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
                    <div>
                      <label htmlFor="technicalFirstName">First Name</label>
                      <input
                        type="text"
                        id="technicalFirstName"
                        name="technicalFirstName"
                        value={formData.contacts[1].firstName}
                        onChange={(e) => handleContactChange('technical', 'firstName', e.target.value)}
                      />
                    </div>

                    <div>
                      <label htmlFor="technicalLastName">Last Name</label>
                      <input
                        type="text"
                        id="technicalLastName"
                        name="technicalLastName"
                        value={formData.contacts[1].lastName}
                        onChange={(e) => handleContactChange('technical', 'lastName', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="technicalJobTitle">Job Title</label>
                    <input
                      type="text"
                      id="technicalJobTitle"
                      name="technicalJobTitle"
                      value={formData.contacts[1].jobTitle}
                      onChange={(e) => handleContactChange('technical', 'jobTitle', e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
                    <div>
                      <label htmlFor="technicalEmail">Business Email</label>
                      <input
                        type="email"
                        id="technicalEmail"
                        name="technicalEmail"
                        value={formData.contacts[1].businessEmail}
                        onChange={(e) => handleContactChange('technical', 'businessEmail', e.target.value)}
                      />
                    </div>

                    <div>
                      <label htmlFor="technicalPhoneNumber">Phone Number</label>
                      <input
                        type="tel"
                        id="technicalPhoneNumber"
                        name="technicalPhoneNumber"
                        value={formData.contacts[1].phoneNumber}
                        onChange={(e) => handleContactChange('technical', 'phoneNumber', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="country">
                  Country/Territory <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
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
            <h3 style={{ marginBottom: 'var(--space-6)' }}>Company Details</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <div>
                <label htmlFor="primaryPartnerBusiness">
                  Primary Partner Business <span className="text-accent">*</span>
                </label>
                <Select
                  inputId="primaryPartnerBusiness"
                  isMulti
                  options={primaryPartnerBusinessOptions.map(opt => ({ value: opt, label: opt }))}
                  value={formData.primaryPartnerBusiness.map(val => ({ value: val, label: val }))}
                  onChange={(selected) => handleMultiSelectChange('primaryPartnerBusiness', selected)}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select options..."
                />
              </div>

              <div>
                <label htmlFor="marketFocus">
                  Market Focus <span className="text-accent">*</span>
                </label>
                <Select
                  inputId="marketFocus"
                  isMulti
                  options={marketFocusOptions.map(opt => ({ value: opt, label: opt }))}
                  value={formData.marketFocus.map(val => ({ value: val, label: val }))}
                  onChange={(selected) => handleMultiSelectChange('marketFocus', selected)}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select options..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
                <div>
                  <label htmlFor="numberOfEmployees">
                    Number of Employees <span className="text-accent">*</span>
                  </label>
                  <select
                    id="numberOfEmployees"
                    name="numberOfEmployees"
                    value={formData.numberOfEmployees}
                    onChange={handleChange}
                    required
                    style={{ 
                      width: '100%',
                      padding: 'var(--space-3) var(--space-4)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--gray-300)',
                      backgroundColor: '#ffffff',
                      color: 'var(--gray-950)',
                      fontSize: 'var(--text-base)',
                      fontFamily: 'var(--font-sans)'
                    }}
                  >
                    <option value="">Select...</option>
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-200">51-200</option>
                    <option value="201-500">201-500</option>
                    <option value="501-1000">501-1000</option>
                    <option value="1001-5000">1001-5000</option>
                    <option value="5000+">5000+</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="annualRevenue">
                    Annual Revenue (USD) <span className="text-accent">*</span>
                  </label>
                  <select
                    id="annualRevenue"
                    name="annualRevenue"
                    value={formData.annualRevenue}
                    onChange={handleChange}
                    required
                    style={{ 
                      width: '100%',
                      padding: 'var(--space-3) var(--space-4)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--gray-300)',
                      backgroundColor: '#ffffff',
                      color: 'var(--gray-950)',
                      fontSize: 'var(--text-base)',
                      fontFamily: 'var(--font-sans)'
                    }}
                  >
                    <option value="">Select...</option>
                    <option value="<$1M">&lt;$1M</option>
                    <option value="$1M-$10M">$1M-$10M</option>
                    <option value="$10M-$50M">$10M-$50M</option>
                    <option value="$50M-$100M">$50M-$100M</option>
                    <option value="$100M-$500M">$100M-$500M</option>
                    <option value="$500M-$1B">$500M-$1B</option>
                    <option value="$1B+">$1B+</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="industryVerticalFocus">
                  Industry/Vertical Focus <span className="text-accent">*</span>
                </label>
                <Select
                  inputId="industryVerticalFocus"
                  isMulti
                  options={industryVerticalOptions.map(opt => ({ value: opt, label: opt }))}
                  value={formData.industryVerticalFocus.map(val => ({ value: val, label: val }))}
                  onChange={(selected) => handleMultiSelectChange('industryVerticalFocus', selected)}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select options..."
                />
              </div>
            </div>
          </div>
        )
      
      case 3:
        return (
          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            <h3 style={{ marginBottom: 'var(--space-6)' }}>Partnership Information</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <div>
                <label>
                  Use Cases <span className="text-accent">*</span>
                </label>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 'var(--space-3)',
                  padding: 'var(--space-4)',
                  border: '1px solid var(--gray-300)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#ffffff',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {useCaseOptions.map(option => (
                    <label key={option} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        name="useCases"
                        value={option}
                        checked={formData.useCases.includes(option)}
                        onChange={handleChange}
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-950)' }}>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="graphDatabaseFit">
                  Where does graph database technology fit into your portfolio? <span className="text-accent">*</span>
                </label>
                <textarea
                  id="graphDatabaseFit"
                  name="graphDatabaseFit"
                  value={formData.graphDatabaseFit}
                  onChange={handleChange}
                  required
                  rows="4"
                  placeholder="Describe how graph database technology fits into your offerings..."
                />
              </div>

              <div>
                <label htmlFor="keyPartners">
                  Key Partners <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  id="keyPartners"
                  name="keyPartners"
                  value={formData.keyPartners}
                  onChange={handleChange}
                  required
                  placeholder="List your key technology partners"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
                <div>
                  <label htmlFor="arangoEngagements">
                    How many Arango engagements have you undertaken? <span className="text-accent">*</span>
                  </label>
                  <input
                    type="text"
                    id="arangoEngagements"
                    name="arangoEngagements"
                    value={formData.arangoEngagements}
                    onChange={handleChange}
                    required
                    placeholder="e.g., 5-10"
                  />
                </div>

                <div>
                  <label htmlFor="trainedStaffMembers">
                    How many staff members are graph/Arango trained? <span className="text-accent">*</span>
                  </label>
                  <input
                    type="text"
                    id="trainedStaffMembers"
                    name="trainedStaffMembers"
                    value={formData.trainedStaffMembers}
                    onChange={handleChange}
                    required
                    placeholder="e.g., 10-15"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="aiExperience">
                  How many staff members have AI experience? <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  id="aiExperience"
                  name="aiExperience"
                  value={formData.aiExperience}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 8-12"
                />
              </div>

              <div>
                <label htmlFor="additionalComments">
                  Additional Comments
                </label>
                <textarea
                  id="additionalComments"
                  name="additionalComments"
                  value={formData.additionalComments}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Any additional information you'd like to share..."
                />
              </div>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  if (fetchLoading && mode === 'edit') {
    return (
      <div style={isModal ? {} : { 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: 'var(--space-6)',
        backgroundColor: 'var(--gray-50)'
      }}>
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <p style={{ color: 'var(--gray-600)' }}>Loading partner data...</p>
        </div>
      </div>
    )
  }

  const content = (
    <>
      {!isModal && (
        <div style={{ marginBottom: 'var(--space-8)', textAlign: 'center' }}>
          <h1 style={{ marginBottom: 'var(--space-4)' }}>
            {mode === 'edit' ? 'Edit Partner' : 'Partner Registration'}
          </h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--gray-700)' }}>
            {mode === 'edit' 
              ? 'Update the partner information below.'
              : 'Please complete all sections to register as an ArangoDB partner.'}
          </p>
        </div>
      )}

      {/* Wizard Progress */}
      <div className="wizard-progress">
        {steps.map((step) => (
          <div 
            key={step.number} 
            className={`wizard-step ${
              currentStep === step.number ? 'active' : ''
            } ${currentStep > step.number ? 'completed' : ''}`}
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
              disabled={mutationLoading}
            >
              {mutationLoading 
                ? (mode === 'edit' ? 'Updating...' : 'Submitting...') 
                : (mode === 'edit' ? 'Update Partner' : 'Submit Registration')}
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

export default PartnerRegistration
