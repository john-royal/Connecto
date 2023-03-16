import '../../App.css'
import Box from '@mui/joy/Box'
import Typography from '@mui/joy/Typography'
import ContactSupportIcon from '@mui/icons-material/ContactSupport'
import Card from '@mui/joy/Card'
import CardContent from '@mui/joy/CardContent'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import Header from '../../components/Header'

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

  return (
    <>
      <DashboardLayout>
        <Header leaveChat={false}/>
        <div className="JoinChat">
          <Box
            sx={{
              minWidth: 500,
              minHeight: 200,
              border: 3,
              borderColor: '#70ACB1'
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
