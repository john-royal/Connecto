import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';

function ChatView() {
  return (
    <DashboardLayout sidebarItems={<LeaveChatButton />}>
      <p>Insert chat here...</p>
    </DashboardLayout>
  );
}

function LeaveChatButton(): JSX.Element {
  const card = (
    <Card>
      <CardContent>
        <Typography level="h4" component="div">
          Leave Chat
        </Typography>
        <CloseIcon sx={{ fontSize: 75, color: '#5e8b8f' }} />
      </CardContent>
    </Card>
  );

  return (
    <div className="LeaveChat">
      <Box sx={{ minWidth: 100, minHeight: 100, border: 3, borderColor: '#59606D' }}>
        <Link to="/">{card}</Link>
      </Box>
    </div>
  );
}

export default ChatView;
