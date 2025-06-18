import { Route, Routes } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import Layout from './Layout';
import LoginForm from './LoginForm';
import Home from './Home';
import Docs from './pages/Docs/Docs';
import Patients from './pages/Patients/Patients';
import Schedule from './pages/Schedule/Schedule';
import Bookings from './pages/Bookings/Bookings';

function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="login" element={<LoginForm />} />

          <Route element={<PrivateRoute />}>
            <Route index element={<Home />} />
            <Route path="docs" element={<Docs />} />
            <Route path="patients" element={<Patients />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="bookings" element={<Bookings />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
