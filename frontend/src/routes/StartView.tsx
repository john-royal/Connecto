import ContactSupportIcon from '@mui/icons-material/ContactSupport'
import Box from '@mui/joy/Box'
import Card from '@mui/joy/Card'
import CardContent from '@mui/joy/CardContent'
import Typography from '@mui/joy/Typography'
import { Link } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'

function StartView() {
  const card = (
    <Card>
      <CardContent>
        <Typography level="h2" component="div">
          Need help?
        </Typography>
        <Typography level="h5">Click here to join a support chat!</Typography>
        <ContactSupportIcon sx={{ fontSize: 100, color: '#5e8b8f' }} />
      </CardContent>
    </Card>
  )

  return (
    <DashboardLayout>
      <div className="JoinChat">
        <Box
          sx={{
            minWidth: 500,
            minHeight: 245,
            border: 3,
            borderColor: '#59606D'
          }}
        >
          <Link to="/chat">{card}</Link>
        </Box>
      </div>
    </DashboardLayout>
  )
}

export default StartView
