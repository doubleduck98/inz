import { Outlet } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

const PrivateRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading..</div>;
  }

  if (!user) {
    window.location.replace('https://localhost:7258/Account/Login');
  }

  return <Outlet />;
};

export default PrivateRoute;
