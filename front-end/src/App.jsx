import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import PartnerRegistration from './pages/PartnerRegistration'
import PartnerDetail from './pages/PartnerDetail'
import ManagePartners from './pages/ManagePartners'
import OpportunityRegistration from './pages/OpportunityRegistration'
import OpportunityDetail from './pages/OpportunityDetail'
import ManageOpportunities from './pages/ManageOpportunities'
import ManageProducts from './pages/ManageProducts'
import ProductRegistration from './pages/ProductRegistration'
import Reports from './pages/Reports'
import SelfServiceExample from './pages/SelfServiceExample'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/self-service" element={<SelfServiceExample />} />
        <Route path="/register" element={<PartnerRegistration />} />
        <Route path="/partners" element={<ManagePartners />} />
        <Route path="/partners/:id" element={<PartnerDetail />} />
        <Route path="/partners/edit/:id" element={<PartnerRegistration mode="edit" />} />
        <Route path="/opportunities" element={<ManageOpportunities />} />
        <Route path="/opportunities/create" element={<OpportunityDetail mode="create" />} />
        <Route path="/opportunities/:id" element={<OpportunityDetail />} />
        <Route path="/opportunities/register" element={<OpportunityRegistration />} />
        <Route path="/opportunities/edit/:id" element={<OpportunityRegistration mode="edit" />} />
        <Route path="/products" element={<ManageProducts />} />
        <Route path="/products/register" element={<ProductRegistration />} />
        <Route path="/products/edit/:id" element={<ProductRegistration mode="edit" />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </Router>
  )
}

export default App
