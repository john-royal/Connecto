import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../lib/auth';

interface DashboardLayoutProps {
  children: ReactNode;
  sidebarItems?: ReactNode;
}

function DashboardLayout({ children, sidebarItems }: DashboardLayoutProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user === null) {
      navigate('/sign-in');
    }
  }, [user, navigate]);

  return (
    <div className="App">
      <Sidebar>{sidebarItems}</Sidebar>
      {children}
    </div>
  );
}

export default DashboardLayout;
