import PartnerRegistrationModal from '../components/PartnerRegistrationModal'
import OpportunityRegistrationModal from '../components/OpportunityRegistrationModal'

function SelfServiceExample() {
  return (
    <div style={{ 
      minHeight: '100vh',
      padding: 'var(--space-8)',
      backgroundColor: 'var(--gray-50)'
    }}>
      <div style={{ 
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <header style={{ 
          marginBottom: 'var(--space-12)',
          textAlign: 'center'
        }}>
          <h1 style={{ 
            fontSize: 'var(--text-4xl)',
            marginBottom: 'var(--space-4)',
            color: 'var(--gray-950)'
          }}>
            Welcome to ArangoDB Partner Portal
          </h1>
          <p style={{ 
            fontSize: 'var(--text-lg)',
            color: 'var(--gray-600)',
            marginBottom: 'var(--space-8)'
          }}>
            Join our partner ecosystem or register new opportunities
          </p>
        </header>

        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--space-6)',
          marginBottom: 'var(--space-12)'
        }}>
          <div className="card" style={{ 
            padding: 'var(--space-8)',
            textAlign: 'center'
          }}>
            <h2 style={{ 
              fontSize: 'var(--text-2xl)',
              marginBottom: 'var(--space-4)',
              color: 'var(--gray-950)'
            }}>
              Become a Partner
            </h2>
            <p style={{ 
              color: 'var(--gray-600)',
              marginBottom: 'var(--space-6)',
              lineHeight: '1.6'
            }}>
              Join our growing partner network and unlock new opportunities for collaboration and growth.
            </p>
            <PartnerRegistrationModal />
          </div>

          <div className="card" style={{ 
            padding: 'var(--space-8)',
            textAlign: 'center'
          }}>
            <h2 style={{ 
              fontSize: 'var(--text-2xl)',
              marginBottom: 'var(--space-4)',
              color: 'var(--gray-950)'
            }}>
              Register Opportunity
            </h2>
            <p style={{ 
              color: 'var(--gray-600)',
              marginBottom: 'var(--space-6)',
              lineHeight: '1.6'
            }}>
              Already a partner? Register a new sales opportunity and start collaborating with us.
            </p>
            <OpportunityRegistrationModal />
          </div>
        </div>

        <section style={{ 
          backgroundColor: 'white',
          padding: 'var(--space-8)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ 
            fontSize: 'var(--text-xl)',
            marginBottom: 'var(--space-4)',
            color: 'var(--gray-950)'
          }}>
            Why Partner with ArangoDB?
          </h3>
          <ul style={{ 
            listStyle: 'none',
            padding: 0,
            display: 'grid',
            gap: 'var(--space-3)',
            color: 'var(--gray-700)'
          }}>
            <li style={{ display: 'flex', alignItems: 'start', gap: 'var(--space-2)' }}>
              <span style={{ color: 'var(--color-electric-lime)', fontSize: '1.25rem' }}>✓</span>
              <span>Access to cutting-edge graph database technology</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'start', gap: 'var(--space-2)' }}>
              <span style={{ color: 'var(--color-electric-lime)', fontSize: '1.25rem' }}>✓</span>
              <span>Technical training and certification programs</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'start', gap: 'var(--space-2)' }}>
              <span style={{ color: 'var(--color-electric-lime)', fontSize: '1.25rem' }}>✓</span>
              <span>Marketing and sales enablement resources</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'start', gap: 'var(--space-2)' }}>
              <span style={{ color: 'var(--color-electric-lime)', fontSize: '1.25rem' }}>✓</span>
              <span>Dedicated partner support team</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}

export default SelfServiceExample
