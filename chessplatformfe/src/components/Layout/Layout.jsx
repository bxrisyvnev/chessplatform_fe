import { Outlet } from 'react-router-dom'
import Header from '../Header/Header'
import Sidebar from '../Sidebar/Sidebar'
import TabNavigation from '../TabNavigation/TabNavigation'

function Layout() {
  return (
    <div className="min-vh-100 d-flex flex-column">
      <Header />
      <div className="container-fluid flex-grow-1">
        <div className="row h-100">
          <div className="col-md-3 col-lg-2 d-none d-md-block">
            <Sidebar />
          </div>
          <main className="col-md-9 col-lg-10 px-md-4 py-4">
            <TabNavigation />
            <div className="bg-white p-4 rounded shadow-sm">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default Layout