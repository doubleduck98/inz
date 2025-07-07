import { Center, Stack, Title, Button, Text, Container } from '@mantine/core';
import { useLocation } from 'react-router-dom';

const Login = () => {
  const location = useLocation();
  const currentPath = location.pathname + location.search;
  const returnUrl = encodeURIComponent(currentPath);
  const TARGET_URL = import.meta.env.TARGET_URL;
  const loginUrl = `${TARGET_URL}/Account/Login?returnUrl=${returnUrl}`;

  return (
    <Container fluid h="80vh" style={{ alignContent: 'center' }}>
      <Center>
        <Stack align="center" gap="lg">
          <Title order={1} ta="center" mb="md">
            Brak dostępu
          </Title>
          <Text size="xl" ta="center" c="dimmed">
            Aby uzyskać dostęp do tej strony, należy się zalogować.
          </Text>
          <Button
            size="lg"
            radius="md"
            onClick={() => {
              window.location.replace(loginUrl);
            }}
            mt="md"
          >
            Zaloguj się
          </Button>
        </Stack>
      </Center>
    </Container>
  );
};

export default Login;
