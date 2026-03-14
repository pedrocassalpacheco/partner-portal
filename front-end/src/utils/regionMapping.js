// Map countries to regions (AMER, EMEA, APAC)
const countryToRegion = {
  // Americas (AMER)
  'United States': 'AMER',
  'USA': 'AMER',
  'Canada': 'AMER',
  'Mexico': 'AMER',
  'Brazil': 'AMER',
  'Argentina': 'AMER',
  'Chile': 'AMER',
  'Colombia': 'AMER',
  'Peru': 'AMER',
  'Venezuela': 'AMER',
  'Ecuador': 'AMER',
  'Bolivia': 'AMER',
  'Paraguay': 'AMER',
  'Uruguay': 'AMER',
  'Costa Rica': 'AMER',
  'Panama': 'AMER',
  'Guatemala': 'AMER',
  'Honduras': 'AMER',
  'Nicaragua': 'AMER',
  'El Salvador': 'AMER',
  'Dominican Republic': 'AMER',
  'Puerto Rico': 'AMER',
  'Jamaica': 'AMER',
  'Trinidad and Tobago': 'AMER',
  'Bahamas': 'AMER',
  'Barbados': 'AMER',
  'Haiti': 'AMER',
  'Cuba': 'AMER',

  // Europe, Middle East, Africa (EMEA)
  'United Kingdom': 'EMEA',
  'UK': 'EMEA',
  'Germany': 'EMEA',
  'France': 'EMEA',
  'Italy': 'EMEA',
  'Spain': 'EMEA',
  'Netherlands': 'EMEA',
  'Belgium': 'EMEA',
  'Switzerland': 'EMEA',
  'Austria': 'EMEA',
  'Sweden': 'EMEA',
  'Norway': 'EMEA',
  'Denmark': 'EMEA',
  'Finland': 'EMEA',
  'Poland': 'EMEA',
  'Czech Republic': 'EMEA',
  'Hungary': 'EMEA',
  'Romania': 'EMEA',
  'Greece': 'EMEA',
  'Portugal': 'EMEA',
  'Ireland': 'EMEA',
  'Russia': 'EMEA',
  'Turkey': 'EMEA',
  'Ukraine': 'EMEA',
  'Israel': 'EMEA',
  'Saudi Arabia': 'EMEA',
  'United Arab Emirates': 'EMEA',
  'UAE': 'EMEA',
  'Qatar': 'EMEA',
  'Kuwait': 'EMEA',
  'Oman': 'EMEA',
  'Bahrain': 'EMEA',
  'Egypt': 'EMEA',
  'South Africa': 'EMEA',
  'Nigeria': 'EMEA',
  'Kenya': 'EMEA',
  'Morocco': 'EMEA',
  'Tunisia': 'EMEA',
  'Algeria': 'EMEA',
  'Ghana': 'EMEA',
  'Ethiopia': 'EMEA',
  'Tanzania': 'EMEA',
  'Uganda': 'EMEA',

  // Asia Pacific (APAC)
  'China': 'APAC',
  'Japan': 'APAC',
  'India': 'APAC',
  'South Korea': 'APAC',
  'Australia': 'APAC',
  'Singapore': 'APAC',
  'Hong Kong': 'APAC',
  'Taiwan': 'APAC',
  'Thailand': 'APAC',
  'Malaysia': 'APAC',
  'Indonesia': 'APAC',
  'Philippines': 'APAC',
  'Vietnam': 'APAC',
  'New Zealand': 'APAC',
  'Pakistan': 'APAC',
  'Bangladesh': 'APAC',
  'Sri Lanka': 'APAC',
  'Myanmar': 'APAC',
  'Cambodia': 'APAC',
  'Laos': 'APAC',
  'Mongolia': 'APAC',
  'Nepal': 'APAC',
  'Bhutan': 'APAC',
  'Brunei': 'APAC',
  'Papua New Guinea': 'APAC',
  'Fiji': 'APAC',
  'Samoa': 'APAC'
}

/**
 * Get the region (AMER, EMEA, APAC) for a given country
 * @param {string} country - The country name
 * @returns {string} - The region code or 'Other' if not found
 */
export const getRegionForCountry = (country) => {
  if (!country) return 'Other'
  return countryToRegion[country] || 'Other'
}

/**
 * Get region distribution from a list of partners
 * @param {Array} partners - Array of partner objects with country property
 * @returns {Object} - Object with region counts
 */
export const getRegionDistribution = (partners) => {
  const distribution = {
    AMER: 0,
    EMEA: 0,
    APAC: 0,
    Other: 0
  }

  partners.forEach(partner => {
    const region = getRegionForCountry(partner.country)
    distribution[region] = (distribution[region] || 0) + 1
  })

  return distribution
}

/**
 * Convert region distribution to array format for charts
 * @param {Object} distribution - Region distribution object
 * @returns {Array} - Array of objects with name and value properties
 */
export const formatRegionDataForChart = (distribution) => {
  return Object.entries(distribution)
    .filter(([_, value]) => value > 0) // Only include regions with partners
    .map(([name, value]) => ({ name, value }))
}
