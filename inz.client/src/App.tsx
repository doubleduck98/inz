import { Route, Routes } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import Layout from './Layout';
import LoginForm from './LoginForm';
import Test from './Test';
import Home from './Home';
import Docs from './pages/Docs/Docs';

function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="login" element={<LoginForm />} />

          <Route element={<PrivateRoute />}>
            <Route index element={<Home />} />
            <Route path="test" element={<Test />} />
            <Route path="docs" element={<Docs />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
