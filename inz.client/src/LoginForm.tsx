import {
  Anchor,
  Box,
  Button,
  Checkbox,
  Container,
  Group,
  Notification,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
  useMantineTheme,
} from '@mantine/core';
import '@mantine/core/styles.css';
import { useForm } from '@mantine/form';
import { useEffect, useRef, useState } from 'react';
import { useDisclosure, useLocalStorage } from '@mantine/hooks';
import { useAuth } from './hooks/useAuth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const { user, login, logout } = useAuth();
  const theme = useMantineTheme();
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },

    validate: {
      email: (val) => {
        if (val.length === 0) return 'Proszę podać email';
        if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/.test(val))
          return 'Niepoprawny adres email';
        return null;
      },
      password: (val) => {
        return val.length === 0 ? 'Proszę podać hasło' : null;
      },
    },
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [credentials, saveCreds, deleteCreds] = useLocalStorage({
    key: 'login_saved_credentials',
    defaultValue: '',
  });
  const init = useRef(false);
  useEffect(() => {
    if (!init.current && credentials) {
      form.setFieldValue('email', credentials);
      setRememberMe(true);
      init.current = true;
    }
  }, [credentials, form]);

  const [loading, isLoading] = useDisclosure(false);
  const [errorVisible, setError] = useState(false);
  const navigate = useNavigate();
  async function handleLogin() {
    const opts = {
      url: 'Auth/Login',
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      data: {
        email: form.values.email,
        password: form.values.password,
      },
    };
    isLoading.open();
    setTimeout(async () => {
      try {
        const { data } = await axios.request(opts);
        login(data);

        if (rememberMe) {
          saveCreds(form.values.email);
        } else {
          deleteCreds();
        }

        navigate('/');
      } catch {
        setError(true);
      } finally {
        isLoading.close();
      }
    }, 800);
  }

  const handleLogout = () => {
    logout();
  };

  const titleStyles = () => ({
    root: {
      fontFamily: `Greycliff CF, ${theme.fontFamily}`,
      fontWeight: 900,
    },
  });

  return (
    <Container size={420} my={{ base: 20, sm: 40 }}>
      <Title ta="center" styles={titleStyles}>
        To jest placeholder
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        To też jest
      </Text>

      <form onSubmit={form.onSubmit(handleLogin)}>
        <Box pos="relative">
          <Paper
            withBorder
            shadow="md"
            p={{ base: 20, sm: 30 }}
            mt={{ base: 20, sm: 30 }}
            radius="md"
          >
            {errorVisible && (
              <Notification
                color="red"
                title="Błąd logowania"
                onClose={() => setError(false)}
              >
                {'Wystąpił problem podczas próby logowania.'}
              </Notification>
            )}

            <TextInput
              label="Email"
              placeholder="twój@email.pl"
              value={form.values.email}
              onChange={(event) =>
                form.setFieldValue('email', event.currentTarget.value)
              }
              error={form.errors.email}
            />
            <PasswordInput
              label="Hasło"
              value={form.values.password}
              onChange={(event) =>
                form.setFieldValue('password', event.currentTarget.value)
              }
              placeholder="Twoje hasło"
              error={form.errors.password}
              mt="md"
            />
            <Group justify="space-between" mt="lg">
              <Checkbox
                label="Zapamiętaj mnie"
                defaultChecked={false}
                checked={rememberMe}
                onChange={() => {
                  setRememberMe((prev) => !prev);
                }}
              />
              <Anchor component="button" size="sm" c="dimmed">
                Zapomniałeś hasła?
              </Anchor>
            </Group>
            <Button type="submit" fullWidth mt="xl" loading={loading}>
              Zaloguj się
            </Button>
          </Paper>
        </Box>
      </form>

      <div>
        {user ? (
          <Button
            onClick={() => {
              handleLogout();
            }}
          >
            Logout
          </Button>
        ) : (
          'not logged in'
        )}
      </div>
    </Container>
  );
}

export default LoginForm;
