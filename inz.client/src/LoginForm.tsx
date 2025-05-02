import {
  Anchor,
  Button,
  Checkbox,
  Container,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import '@mantine/core/styles.css';

function LoginForm() {
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
    },
  });

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

      <form onSubmit={form.onSubmit(() => {})}>
        <Paper
          withBorder
          shadow="md"
          p={{ base: 20, sm: 30 }}
          mt={{ base: 20, sm: 30 }}
          radius="md"
        >
          <TextInput
            label="Email"
            placeholder="twój@email.pl"
            value={form.values.email}
            onChange={(event) =>
              form.setFieldValue('email', event.currentTarget.value)
            }
            error={form.errors.email}
          />
          <PasswordInput label="Hasło" placeholder="Twoje hasło" mt="md" />
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
      </form>
    </Container>
  );
}

export default LoginForm;
