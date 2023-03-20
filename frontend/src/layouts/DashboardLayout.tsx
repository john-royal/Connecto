import { type ReactNode, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

interface DashboardLayoutProps {
  children: ReactNode
  sidebarItems?: ReactNode
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user === null) {
      navigate('/sign-in')
    }
    else if (user?.isAdmin) {
      navigate('/admin')
    }
  }, [user, navigate])

  return <div className="App">{children}</div>
}

export default DashboardLayout
