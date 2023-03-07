import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';
import { Link } from 'react-router-dom';

function LeaveChat(): JSX.Element {
  const card = (
    <>
      <CardContent>
        <Typography level="h4" component="div">
          Leave Chat
        </Typography>
        <CloseIcon sx={{ fontSize: 75, color: '#5e8b8f' }} />
      </CardContent>
    </>
  );

  return (
    <Box sx={{ minWidth: 100, minHeight: 100, border: 3, borderColor: '#59606D' }}>
      <Link to="/">
        <Card variant="outlined">{card}</Card>
      </Link>
    </Box>
  );
}

export default LeaveChat;
