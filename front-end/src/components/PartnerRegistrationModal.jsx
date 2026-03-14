import { useState } from 'react'
import Modal from '../components/Modal'
import PartnerRegistration from '../pages/PartnerRegistration'

function PartnerRegistrationModal() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button 
        className="btn btn--primary"
        onClick={() => setIsOpen(true)}
      >
        Request Partner Registration
      </button>

      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        title="Partner Registration"
        maxWidth="900px"
      >
        <PartnerRegistration 
          mode="create" 
          isModal={true}
          onSuccess={() => setIsOpen(false)}
        />
      </Modal>
    </>
  )
}

export default PartnerRegistrationModal
