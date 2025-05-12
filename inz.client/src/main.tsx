import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { Authorize } from './hooks/useAuth.tsx';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Authorize>
        <MantineProvider defaultColorScheme="dark">
          <App />
        </MantineProvider>
      </Authorize>
    </BrowserRouter>
  </StrictMode>
);
