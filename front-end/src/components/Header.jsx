import { useState, useEffect } from 'react'

function Header() {
  const [isHealthy, setIsHealthy] = useState(true)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('http://localhost:8081/api/health')
        setIsHealthy(response.ok)
      } catch (error) {
        setIsHealthy(false)
      }
    }

    // Check immediately on mount
    checkHealth()

    // Then check every 5 seconds
    const interval = setInterval(checkHealth, 5000)

    // Cleanup on unmount
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <div className="site-logo">
          <img src="/arango_logo.png" alt="Arango" style={{ height: '40px', width: 'auto' }} />
        </div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
          <ul className="site-nav">
            <li className="site-nav__item">
              <a href="#" className="site-nav__link">Home</a>
            </li>
            <li className="site-nav__item">
              <a href="#" className="site-nav__link">Documentation</a>
            </li>
            <li className="site-nav__item">
              <a href="#" className="site-nav__link">Support</a>
            </li>
          </ul>
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--space-2)',
              fontSize: 'var(--text-xs)',
              color: '#666666'
            }}
            title={isHealthy ? 'API is healthy' : 'API is unavailable'}
          >
            <div 
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: isHealthy ? '#22c55e' : '#ef4444',
                boxShadow: isHealthy 
                  ? '0 0 8px rgba(34, 197, 94, 0.6)' 
                  : '0 0 8px rgba(239, 68, 68, 0.6)',
                transition: 'all 0.3s ease'
              }}
            />
            <span style={{ fontWeight: 500 }}>
              {isHealthy ? 'API Online' : 'API Offline'}
            </span>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Header
