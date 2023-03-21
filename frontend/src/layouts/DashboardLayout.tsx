import { Outlet } from 'react-router-dom'
import { RequireAuth } from '../lib/auth'

function DashboardLayout() {
  return (
    <RequireAuth isAdmin={false}>
      <div className="App">
        <Outlet />
      </div>
    </RequireAuth>
  )
}

export default DashboardLayout
