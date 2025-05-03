import {
  Anchor,
  Box,
  Button,
  Checkbox,
  Container,
  Group,
  LoadingOverlay,
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
import { useState } from 'react';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import axios from 'axios';

function LoginForm() {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
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

  const [loading, isLoading] = useDisclosure(false);
  const [errorVisible, setError] = useState(false);
  async function login() {
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
        console.log(data);
      } catch {
        setError(true);
      } finally {
        isLoading.close();
      }
    }, 1200);
  }

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

      <form onSubmit={form.onSubmit(() => login())}>
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

            {!isMobile && (
              <LoadingOverlay
                visible={loading}
                overlayProps={{ radius: 'sm', blur: 2 }}
              />
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
              <Checkbox label="Zapamiętaj mnie" />
              <Anchor component="button" size="sm" c="dimmed">
                Zapomniałeś hasła?
              </Anchor>
            </Group>
            <Button type="submit" fullWidth mt="xl">
              Zaloguj się
            </Button>
          </Paper>
        </Box>
      </form>

      {isMobile && (
        <LoadingOverlay
          zIndex={1000}
          visible={loading}
          overlayProps={{ radius: 'sm', blur: 2 }}
        />
      )}
    </Container>
  );
}

export default LoginForm;
