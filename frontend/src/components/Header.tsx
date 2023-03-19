import Person from '@mui/icons-material/Person'
import Box from '@mui/joy/Box'
import IconButton from '@mui/joy/IconButton'
import Menu from '@mui/joy/Menu'
import MenuItem from '@mui/joy/MenuItem'
import Typography from '@mui/joy/Typography'
import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../App.css'
import Logo from '../assets/logo.png'
import { useAuth } from '../lib/auth'

function Header({ leaveChat = true }: { leaveChat?: boolean }) {
  const { user } = useAuth()
  const logoLink = user?.isAdmin ?? false ? '/admin' : '/'

  const logo = (
    <Link
      to={logoLink}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        textDecoration: 'none'
      }}
    >
      <Typography component="h1" fontWeight="xl">
        <img src={Logo} alt="Logo" width="123" height="53" />
      </Typography>
    </Link>
  )

  function HeaderMenu() {
    const anchor = useRef<HTMLAnchorElement | null>(null)
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()

    const handleClose = () => {
      setOpen(false)
    }

    function handleLeave() {
      navigate('/')
    }

    return (
      <>
        <div>
          {leaveChat && (
            <IconButton
              id="basic-demo-button"
              onClick={handleLeave}
              size="sm"
              variant="outlined"
              sx={[
                {
                  color: '#70ACB1',
                  borderColor: '#70ACB1',
                  backgroundColor: 'white',
                  p: 2,
                  mr: 3,
                  '&:hover': {
                    backgroundColor: '#C6F1E7'
                  },
                  '&:active': {
                    color: 'white',
                    backgroundColor: '#70ACB1'
                  }
                }
              ]}
            >
              Leave Chat
            </IconButton>
          )}
          <IconButton
            id="basic-demo-button"
            aria-controls={open ? 'basic-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={() => {
              setOpen(true)
            }}
            size="sm"
            variant="outlined"
            sx={[
              {
                color: '#70ACB1',
                borderColor: '#70ACB1',
                backgroundColor: 'white',
                p: 1,
                '&:hover': {
                  backgroundColor: '#C6F1E7'
                },
                '&:active': {
                  color: 'white',
                  backgroundColor: '#70ACB1'
                }
              }
            ]}
            aria-label="Me"
            ref={anchor}
          >
            <Person />
          </IconButton>
        </div>
        <Menu
          id="basic-menu"
          placement="bottom-end"
          anchorEl={anchor.current}
          open={open}
          onClose={handleClose}
          aria-labelledby="basic-demo-button"
          sx={{ minWidth: 120, zIndex: 1500 }}
        >
          <MenuItem>Hi, {user?.name ?? 'User'}</MenuItem>
          <MenuItem component={Link} to="/sign-out">
            Sign Out
          </MenuItem>
        </Menu>
      </>
    )
  }

  return (
    <Box
      component="header"
      className="Header"
      sx={{
        p: 2,
        gap: 2,
        bgcolor: '#ecfbf8',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gridColumn: '1 / -1',
        borderBottom: '2px solid',
        borderColor: 'divider',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}
    >
      {logo}
      <HeaderMenu />
    </Box>
  )
}

export default Header
