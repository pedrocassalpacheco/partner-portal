import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'

function Layout({ children }) {
  return (
    <div>
      <Header />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <div className="content-wrapper">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  )
}

export default Layout
