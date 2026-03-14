/**
 * Group opportunities by month and calculate total value
 * @param {Array} opportunities - Array of opportunity objects
 * @returns {Array} - Array of objects with month and value properties
 */
export const groupOpportunitiesByMonth = (opportunities) => {
  const monthlyData = {}

  opportunities.forEach(opp => {
    const date = new Date(opp.createdAt)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthKey,
        value: 0,
        count: 0
      }
    }
    
    monthlyData[monthKey].value += opp.budgetaryAmount || 0
    monthlyData[monthKey].count += 1
  })

  // Convert to array and sort by month
  return Object.values(monthlyData)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(item => ({
      month: formatMonthLabel(item.month),
      monthKey: item.month,
      value: item.value,
      count: item.count
    }))
}

/**
 * Format month key into readable label
 * @param {string} monthKey - Month key in format YYYY-MM
 * @returns {string} - Formatted month label
 */
const formatMonthLabel = (monthKey) => {
  const [year, month] = monthKey.split('-')
  const date = new Date(year, parseInt(month) - 1)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
}

/**
 * Calculate linear regression trend line
 * @param {Array} data - Array of data points with month and value
 * @returns {Array} - Array with trend line values
 */
export const calculateTrendLine = (data) => {
  if (data.length < 2) return data.map(d => ({ ...d, trend: d.value }))

  const n = data.length
  const xValues = data.map((_, i) => i)
  const yValues = data.map(d => d.value)

  // Calculate means
  const xMean = xValues.reduce((sum, x) => sum + x, 0) / n
  const yMean = yValues.reduce((sum, y) => sum + y, 0) / n

  // Calculate slope (m) and intercept (b) for y = mx + b
  let numerator = 0
  let denominator = 0

  for (let i = 0; i < n; i++) {
    numerator += (xValues[i] - xMean) * (yValues[i] - yMean)
    denominator += (xValues[i] - xMean) ** 2
  }

  const slope = denominator !== 0 ? numerator / denominator : 0
  const intercept = yMean - slope * xMean

  // Calculate trend values
  return data.map((item, i) => ({
    ...item,
    trend: slope * i + intercept
  }))
}

/**
 * Format currency value for display
 * @param {number} value - The numeric value
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

/**
 * Format large currency values with K/M suffix
 * @param {number} value - The numeric value
 * @returns {string} - Formatted currency string with suffix
 */
export const formatCurrencyShort = (value) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`
  }
  return `$${value.toFixed(0)}`
}
