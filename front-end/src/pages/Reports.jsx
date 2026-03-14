import Layout from '../components/Layout'

function Reports() {
  return (
    <Layout>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ marginBottom: 'var(--space-4)' }}>Reports</h1>
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--gray-700)' }}>
          View analytics and reports for partner activities.
        </p>
      </div>

      <div className="card">
        <h3>Analytics</h3>
        <p style={{ marginTop: 'var(--space-4)', color: 'var(--gray-700)' }}>
          Reports and analytics dashboard will be displayed here.
        </p>
      </div>
    </Layout>
  )
}

export default Reports
