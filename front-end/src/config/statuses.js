// Unified registration statuses for both partners and opportunities
export const REGISTRATION_STATUSES = {
  REQUESTED: 'requested',
  REGISTERED: 'registered',
  DECLINED: 'declined'
}

// Valid statuses array
export const VALID_STATUSES = [
  REGISTRATION_STATUSES.REQUESTED,
  REGISTRATION_STATUSES.REGISTERED,
  REGISTRATION_STATUSES.DECLINED
]

// Status metadata for UI display
export const STATUS_CONFIG = {
  [REGISTRATION_STATUSES.REQUESTED]: {
    label: 'Requested',
    color: '#0c5460',
    backgroundColor: '#d1ecf1',
    borderColor: '#17a2b8',
    icon: 'alert'
  },
  [REGISTRATION_STATUSES.REGISTERED]: {
    label: 'Registered',
    color: '#155724',
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
    icon: 'check'
  },
  [REGISTRATION_STATUSES.DECLINED]: {
    label: 'Declined',
    color: '#721c24',
    backgroundColor: '#f8d7da',
    borderColor: '#dc3545',
    icon: 'x'
  }
}

// Helper function to get status config
export const getStatusConfig = (status) => {
  return STATUS_CONFIG[status] || {
    label: 'N/A',
    color: 'var(--gray-700)',
    backgroundColor: 'var(--gray-200)',
    borderColor: 'var(--gray-300)',
    icon: 'alert'
  }
}

// Legacy aliases for backward compatibility
export const PARTNER_STATUSES = REGISTRATION_STATUSES
export const OPPORTUNITY_STATUSES = REGISTRATION_STATUSES
export const VALID_PARTNER_STATUSES = VALID_STATUSES
export const VALID_OPPORTUNITY_STATUSES = VALID_STATUSES
export const PARTNER_STATUS_CONFIG = STATUS_CONFIG
export const OPPORTUNITY_STATUS_CONFIG = STATUS_CONFIG
export const getPartnerStatusConfig = getStatusConfig
export const getOpportunityStatusConfig = getStatusConfig
