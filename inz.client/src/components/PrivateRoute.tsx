import { Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Login from '@/pages/Login/Login';
import { Center, Container, Loader } from '@mantine/core';

/**
 * Guard component preventing rendering of pages to unauthorised users.
 */
const PrivateRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Container fluid h="80vh" style={{ alignContent: 'center' }}>
        <Center>
          <Loader />
        </Center>
      </Container>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <Outlet />;
};

export default PrivateRoute;
