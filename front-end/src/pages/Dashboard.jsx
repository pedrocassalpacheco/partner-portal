import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { getPartners } from '../services/partnerService'
import { getOpportunities } from '../services/opportunityService'
import { getRegionDistribution, formatRegionDataForChart } from '../utils/regionMapping'
import { groupOpportunitiesByMonth, calculateTrendLine, formatCurrency, formatCurrencyShort } from '../utils/chartUtils'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'

const COLORS = {
  AMER: '#3b82f6',   // Blue
  EMEA: '#10b981',   // Green
  APAC: '#f59e0b',   // Orange
  Other: '#6b7280'   // Gray
}

function Dashboard() {
  const [partners, setPartners] = useState([])
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all partners and opportunities (with high limit to get all data)
      const [partnersResponse, opportunitiesResponse] = await Promise.all([
        getPartners({ page: 1, limit: 1000 }),
        getOpportunities({ page: 1, limit: 1000 })
      ])

      setPartners(partnersResponse.data || [])
      setOpportunities(opportunitiesResponse.data || [])
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Calculate metrics
  const totalPartners = partners.length
  const totalOpportunities = opportunities.length
  const totalOpportunityValue = opportunities.reduce((sum, opp) => sum + (opp.budgetaryAmount || 0), 0)
  const averageOpportunityValue = totalOpportunities > 0 ? totalOpportunityValue / totalOpportunities : 0

  // Prepare chart data
  const regionDistribution = getRegionDistribution(partners)
  const regionChartData = formatRegionDataForChart(regionDistribution)
  const monthlyOpportunities = groupOpportunitiesByMonth(opportunities)
  const opportunitiesWithTrend = calculateTrendLine(monthlyOpportunities)

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
          <p>Loading dashboard data...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ marginBottom: 'var(--space-4)' }}>Dashboard</h1>
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--gray-700)' }}>
          Overview of partners and opportunities across all regions.
        </p>
      </div>

      {error && (
        <div style={{
          padding: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: 'var(--radius-md)',
          color: '#991b1b'
        }}>
          Error loading dashboard data: {error}
        </div>
      )}

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-6)'
      }}>
        <div className="card" style={{
          padding: 'var(--space-5)',
          backgroundColor: 'white',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--gray-200)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-600)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'var(--font-weight-medium)' }}>
            Total Partners
          </div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--gray-950)' }}>
            {totalPartners}
          </div>
        </div>

        <div className="card" style={{
          padding: 'var(--space-5)',
          backgroundColor: 'white',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--gray-200)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-600)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'var(--font-weight-medium)' }}>
            Total Opportunities
          </div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--gray-950)' }}>
            {totalOpportunities}
          </div>
        </div>

        <div className="card" style={{
          padding: 'var(--space-5)',
          backgroundColor: 'white',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--gray-200)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-600)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'var(--font-weight-medium)' }}>
            Total Pipeline Value
          </div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--gray-950)' }}>
            {formatCurrencyShort(totalOpportunityValue)}
          </div>
        </div>

        <div className="card" style={{
          padding: 'var(--space-5)',
          backgroundColor: 'white',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--gray-200)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-600)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'var(--font-weight-medium)' }}>
            Avg Opportunity Value
          </div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--gray-950)' }}>
            {formatCurrencyShort(averageOpportunityValue)}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.5fr',
        gap: 'var(--space-6)',
        marginBottom: 'var(--space-8)'
      }}>
        {/* Partner Distribution by Region - Pie Chart */}
        <div className="card" style={{
          padding: 'var(--space-6)',
          backgroundColor: 'white',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--gray-200)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-weight-semibold)',
            marginBottom: 'var(--space-4)',
            color: 'var(--gray-950)'
          }}>
            Partner Distribution by Region
          </h3>
          {regionChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={regionChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={110}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {regionChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${value} partners`, name]}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => `${value}: ${regionDistribution[value]} partners`}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: 'var(--space-12)', 
              color: 'var(--gray-500)' 
            }}>
              No partner data available
            </div>
          )}
        </div>

        {/* Opportunities Value Over Time - Line Chart with Trend */}
        <div className="card" style={{
          padding: 'var(--space-6)',
          backgroundColor: 'white',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--gray-200)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-weight-semibold)',
            marginBottom: 'var(--space-4)',
            color: 'var(--gray-950)'
          }}>
            Opportunities Value Over Time
          </h3>
          {opportunitiesWithTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={opportunitiesWithTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatCurrencyShort(value)}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'value') return [formatCurrency(value), 'Total Value']
                    if (name === 'trend') return [formatCurrency(value), 'Trend']
                    return [value, name]
                  }}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                />
                <Legend 
                  verticalAlign="top"
                  height={36}
                  formatter={(value) => value === 'value' ? 'Actual Value' : 'Trend Line'}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="trend" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: 'var(--space-12)', 
              color: 'var(--gray-500)' 
            }}>
              No opportunity data available
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
