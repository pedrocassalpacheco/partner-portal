function Footer() {
  return (
    <footer className="site-footer" style={{ marginTop: 'var(--space-24)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', color: '#666666' }}>
          <p>&copy; {new Date().getFullYear()} Arango. All rights reserved.</p>
          <div style={{ marginTop: 'var(--space-4)' }}>
            <a href="#" style={{ color: '#666666', marginInline: 'var(--space-4)' }}>Privacy Policy</a>
            <a href="#" style={{ color: '#666666', marginInline: 'var(--space-4)' }}>Terms of Service</a>
            <a href="#" style={{ color: '#666666', marginInline: 'var(--space-4)' }}>Contact</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
