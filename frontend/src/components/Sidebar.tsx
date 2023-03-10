import LogoutIcon from '@mui/icons-material/Logout'
import SettingsIcon from '@mui/icons-material/Settings'
import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'
import Logo from '../assets/logo.png'

const sidebarItems = [
  {
    title: 'Settings',
    icon: <SettingsIcon />,
    href: '/settings'
  },
  {
    title: 'Sign Out',
    icon: <LogoutIcon />,
    href: '/sign-out'
  }
]

function Sidebar({ children }: { children?: ReactNode }) {
  return (
    <div className="Sidebar">
      <div className="SidebarLogo">
        <img src={Logo} alt="Logo" width="308" height="173" />
      </div>
      <ul className="SidebarList">
        {sidebarItems.map((item) => (
          <SidebarRow {...item} key={item.href} />
        ))}
      </ul>

      {children}
    </div>
  )
}

function SidebarRow({
  title,
  icon,
  href
}: {
  title: string
  icon: ReactNode
  href: string
}) {
  const navigate = useNavigate()

  return (
    <li
      className="row"
      onClick={() => {
        navigate(href)
      }}
    >
      <div id="icon">{icon}</div>
      <div id="title">{title}</div>
    </li>
  )
}

export default Sidebar
