import { useState } from 'react'
import Modal from '../components/Modal'
import OpportunityRegistration from '../pages/OpportunityRegistration'

function OpportunityRegistrationModal() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button 
        className="btn btn--primary"
        onClick={() => setIsOpen(true)}
      >
        Register Opportunity
      </button>

      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        title="Register Opportunity"
        maxWidth="900px"
      >
        <OpportunityRegistration 
          isModal={true}
          onSuccess={() => setIsOpen(false)}
        />
      </Modal>
    </>
  )
}

export default OpportunityRegistrationModal
