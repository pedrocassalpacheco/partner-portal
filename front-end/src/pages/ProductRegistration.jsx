import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import '../form-styles.css'

function ProductRegistration({ mode = 'create' }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: '',
    description: '',
    isActive: true
  })

  useEffect(() => {
    if (mode === 'edit' && id) {
      fetchProduct()
    }
  }, [mode, id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiZXhwIjoxNzQxNjM4NjExfQ.6sN_wXqX5pXGZQxYPBqN7qH5yQPJYPZqYPZqYPY'
      
      const response = await fetch(`http://localhost:8081/api/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const product = await response.json()
        setFormData({
          sku: product.sku,
          name: product.name,
          category: product.category,
          description: product.description,
          isActive: product.isActive
        })
      } else {
        setError('Failed to load product')
      }
    } catch (err) {
      setError('Error loading product: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiZXhwIjoxNzQxNjM4NjExfQ.6sN_wXqX5pXGZQxYPBqN7qH5yQPJYPZqYPZqYPY'
      
      const url = mode === 'edit' 
        ? `http://localhost:8081/api/products/${id}`
        : 'http://localhost:8081/api/products'
      
      const method = mode === 'edit' ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          navigate('/products')
        }, 1500)
      } else {
        const errorText = await response.text()
        setError(`Failed to ${mode === 'edit' ? 'update' : 'create'} product: ${errorText}`)
      }
    } catch (err) {
      setError(`Error ${mode === 'edit' ? 'updating' : 'creating'} product: ` + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="form-container">
        <div className="form-header">
          <h1>{mode === 'edit' ? 'Edit Product' : 'Add New Product'}</h1>
          <p>{mode === 'edit' ? 'Update product information' : 'Add a new product to the catalog'}</p>
        </div>

        {error && (
          <div className="alert alert--error">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert--success">
            Product {mode === 'edit' ? 'updated' : 'created'} successfully! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-section">
            <h2 className="form-section__title">Product Information</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="sku" className="form-label required">
                  SKU
                </label>
                <input
                  type="text"
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className="form-input"
                  required
                  disabled={mode === 'edit'}
                  placeholder="e.g., ARANGO-ENT-PROD-LIC"
                />
                {mode === 'edit' && (
                  <p className="form-help">SKU cannot be changed</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="category" className="form-label required">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Customer Deployed">Customer Deployed</option>
                  <option value="Managed Cloud Services">Managed Cloud Services</option>
                  <option value="Arango Managed Platform">Arango Managed Platform</option>
                  <option value="Professional Services">Professional Services</option>
                  <option value="Training & Certification">Training & Certification</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="name" className="form-label required">
                Product Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="e.g., ArangoDB Enterprise Production License"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label required">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-textarea"
                required
                rows="4"
                placeholder="Describe the product..."
              />
            </div>

            <div className="form-group">
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
                <span className="form-checkbox__label">Active (available for sale)</span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="btn btn--secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : mode === 'edit' ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

export default ProductRegistration
