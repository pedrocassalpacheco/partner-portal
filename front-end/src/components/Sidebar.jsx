import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

function Sidebar() {
  const location = useLocation()
  const [expandedGroups, setExpandedGroups] = useState({
    dashboard: true,
    partners: true,
    opportunities: true,
    system: true,
    resources: true,
  })
  const [sidebarWidth, setSidebarWidth] = useState(300)
  const [isResizing, setIsResizing] = useState(false)
  const sidebarRef = useRef(null)

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }))
  }

  const handleMouseDown = (e) => {
    setIsResizing(true)
    e.preventDefault()
  }

  // Initialize CSS variable on mount
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', `${sidebarWidth}px`)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return
      
      const newWidth = e.clientX
      if (newWidth >= 200 && newWidth <= 500) {
        setSidebarWidth(newWidth)
        // Update CSS variable for main content margin
        document.documentElement.style.setProperty('--sidebar-width', `${newWidth}px`)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  return (
    <aside 
      ref={sidebarRef}
      className="sidebar" 
      style={{ width: `${sidebarWidth}px` }}
    >
      <div className="sidebar__section">
        <button 
          className="sidebar__group-toggle"
          onClick={() => toggleGroup('dashboard')}
          aria-expanded={expandedGroups.dashboard}
        >
          <span className={`sidebar__group-icon ${expandedGroups.dashboard ? 'expanded' : ''}`}>▶</span>
          <span className="sidebar__group-title">Dashboard</span>
        </button>
        {expandedGroups.dashboard && (
          <nav>
            <ul className="sidebar__nav">
              <li className="sidebar__nav-item">
                <Link 
                  to="/" 
                  className="sidebar__nav-link"
                  aria-current={location.pathname === '/' ? 'page' : undefined}
                >
                  Overview
                </Link>
              </li>
              <li className="sidebar__nav-item">
                <Link 
                  to="/reports" 
                  className="sidebar__nav-link"
                  aria-current={location.pathname === '/reports' ? 'page' : undefined}
                >
                  Reports
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>

      <div className="sidebar__section">
        <button 
          className="sidebar__group-toggle"
          onClick={() => toggleGroup('partners')}
          aria-expanded={expandedGroups.partners}
        >
          <span className={`sidebar__group-icon ${expandedGroups.partners ? 'expanded' : ''}`}>▶</span>
          <span className="sidebar__group-title">Partner Management</span>
        </button>
        {expandedGroups.partners && (
          <nav>
            <ul className="sidebar__nav">
              <li className="sidebar__nav-item">
                <Link 
                  to="/register" 
                  className="sidebar__nav-link"
                  aria-current={location.pathname === '/register' ? 'page' : undefined}
                >
                  Registration
                </Link>
              </li>
              <li className="sidebar__nav-item">
                <Link 
                  to="/partners" 
                  className="sidebar__nav-link"
                  aria-current={location.pathname === '/partners' ? 'page' : undefined}
                >
                  Partners
                </Link>
              </li>
               <li className="sidebar__nav-item">
                <Link 
                  to="/opportunities" 
                  className="sidebar__nav-link"
                  aria-current={location.pathname.startsWith('/opportunities') ? 'page' : undefined}
                >
                  Opportunities
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>

    

      <div className="sidebar__section">
        <button 
          className="sidebar__group-toggle"
          onClick={() => toggleGroup('system')}
          aria-expanded={expandedGroups.system}
        >
          <span className={`sidebar__group-icon ${expandedGroups.system ? 'expanded' : ''}`}>▶</span>
          <span className="sidebar__group-title">System</span>
        </button>
        {expandedGroups.system && (
          <nav>
            <ul className="sidebar__nav">
              <li className="sidebar__nav-item">
                <Link 
                  to="/accounts" 
                  className="sidebar__nav-link"
                  aria-current={location.pathname === '/accounts' ? 'page' : undefined}
                >
                  Accounts
                </Link>
              </li>
              <li className="sidebar__nav-item">
                <Link 
                  to="/products" 
                  className="sidebar__nav-link"
                  aria-current={location.pathname === '/products' ? 'page' : undefined}
                >
                  Products
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>

      <div className="sidebar__section">
        <button 
          className="sidebar__group-toggle"
          onClick={() => toggleGroup('resources')}
          aria-expanded={expandedGroups.resources}
        >
          <span className={`sidebar__group-icon ${expandedGroups.resources ? 'expanded' : ''}`}>▶</span>
          <span className="sidebar__group-title">Resources</span>
        </button>
        {expandedGroups.resources && (
          <nav>
            <ul className="sidebar__nav">
              <li className="sidebar__nav-item">
                <a href="#" className="sidebar__nav-link">Partner Guidelines</a>
              </li>
              <li className="sidebar__nav-item">
                <a href="#" className="sidebar__nav-link">Marketing Materials</a>
              </li>
              <li className="sidebar__nav-item">
                <a href="#" className="sidebar__nav-link">Training</a>
              </li>
            </ul>
          </nav>
        )}
      </div>
      <div 
        className="sidebar__resize-handle"
        onMouseDown={handleMouseDown}
        title="Drag to resize"
      />
    </aside>
  )
}

export default Sidebar
