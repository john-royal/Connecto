import '../../App.css'
import Box from '@mui/joy/Box'
import IconButton from '@mui/joy/IconButton'
import Typography from '@mui/joy/Typography'
import ContactSupportIcon from '@mui/icons-material/ContactSupport'
import Card from '@mui/joy/Card'
import CardContent from '@mui/joy/CardContent'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import Person from '@mui/icons-material/Person'
import Menu from '@mui/joy/Menu'
import MenuItem from '@mui/joy/MenuItem'
import Logo from '../../assets/logo.png'
import { useAuth } from '../../lib/auth'
import { useState, useRef } from 'react'

function StartView() {
  const card = (
    <Card>
      <CardContent>
        <Typography level="h2" component="div">
          Need help?
        </Typography>
        <Typography level="h5">Click here to join a support chat!</Typography>
        <div className="centerIcon">
          <ContactSupportIcon sx={{ fontSize: 100, color: '#5e8b8f' }} />
        </div>
      </CardContent>
    </Card>
  )

  const logo = (
    <Link
      to="/admin"
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
    const { user } = useAuth()
    const anchor = useRef<HTMLAnchorElement | null>(null)
    const [open, setOpen] = useState(false)

    const handleClose = () => {
      setOpen(false)
    }

    return (
      <>
        <div>
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
    <>
      <DashboardLayout>
        <Box
          component="header"
          className="Header"
          sx={{
            p: 2,
            gap: 2,
            bgcolor: 'background.surface',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gridColumn: '1 / -1',
            borderBottom: '2px solid',
            borderColor: 'divider',
            position: 'relative',
            top: 0,
            zIndex: 1000
          }}
        >
          {logo}
          <HeaderMenu />
        </Box>
        <div className="JoinChat">
          <Box
            sx={{
              minWidth: 500,
              minHeight: 200,
              border: 3,
              borderColor: '#59606D'
            }}
          >
            <Link to="/chat" style={{ textDecoration: 'none' }}>
              {card}
            </Link>
          </Box>
        </div>
      </DashboardLayout>
    </>
  )
}

export default StartView
