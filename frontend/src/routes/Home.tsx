import Button from '@mui/joy/Button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function Home() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (user === null) {
    navigate('/sign-in');
  }

  return (
    <div>
      <h1>Home</h1>
      <p>Welcome, {user?.name}!</p>
      <Button onClick={signOut}>Sign Out</Button>
    </div>
  );
}
