import { Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Login from '@/pages/Login/Login';

const PrivateRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading..</div>;
  }

  if (!user) {
    return <Login />;
  }

  return <Outlet />;
};

export default PrivateRoute;
