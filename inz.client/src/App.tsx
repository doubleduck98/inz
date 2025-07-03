import { Route, Routes } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout/Layout';
import Home from './pages/Home/Home';
import Docs from './pages/Docs/Docs';
import Patients from './pages/Patients/Patients';
import Schedule from './pages/Schedule/Schedule';
import NotFound from './pages/NotFound/NotFound';

function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route element={<PrivateRoute />}>
            <Route index element={<Home />} />
            <Route path="docs" element={<Docs />} />
            <Route path="patients" element={<Patients />} />
            <Route path="schedule" element={<Schedule />} />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
