import ContactSupportIcon from '@mui/icons-material/ContactSupport'
import Box from '@mui/joy/Box'
import Card from '@mui/joy/Card'
import CardContent from '@mui/joy/CardContent'
import Link from '@mui/joy/Link'
import Typography from '@mui/joy/Typography'
import '../../App.css'
import Header from '../../components/Header'

function StartView() {
  const card = (
    <Card>
      <CardContent>
        <Typography level="h2" component="div" sx={{ color: '#59606D' }}>
          Need help?
        </Typography>
        <Typography level="h5" sx={{ color: '#59606D' }}>
          <Link href="/chat" overlay>
            Click here to join a support chat!
          </Link>
        </Typography>
        <div className="centerIcon">
          <ContactSupportIcon sx={{ fontSize: 100, color: '#5e8b8f' }} />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <>
      <Header />
      <div className="JoinChat">
        <Box
          sx={{
            minWidth: 500,
            minHeight: 200,
            borderRadius: 10,
            border: 3,
            borderColor: '#dbdbe2'
          }}
        >
          {card}
        </Box>
      </div>
    </>
  )
}

export default StartView
