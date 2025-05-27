import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@mantine/core/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/dates/styles.css';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import 'dayjs/locale/pl';
import 'dayjs/plugin/customParseFormat';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { MantineProvider } from '@mantine/core';
import { Authorize } from './hooks/useAuth.tsx';
import App from './App.tsx';
import { ModalsProvider } from '@mantine/modals';
import { DatesProvider } from '@mantine/dates';

dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);
dayjs.locale('pl');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Authorize>
        <MantineProvider defaultColorScheme="dark">
          <ModalsProvider>
            <DatesProvider settings={{ locale: 'pl' }}>
              <App />
            </DatesProvider>
          </ModalsProvider>
        </MantineProvider>
      </Authorize>
    </BrowserRouter>
  </StrictMode>
);
