import { Button, Stack, TextInput } from '@mantine/core';
import { useAddContactFormContext } from './AddContactFormContext';

const AddContactForm = () => {
  const form = useAddContactFormContext();

  return (
    <Stack gap="sm">
      <TextInput
        label="Nazwa"
        placeholder="np. Rodzic"
        withAsterisk
        {...form.getInputProps('name')}
      />
      <TextInput
        label="Adres e-mail"
        placeholder="jan.kowalski@gmail.com"
        type="email"
        {...form.getInputProps('email')}
      />
      <TextInput
        label="Numer telefonu"
        placeholder="+48 781 287 515"
        {...form.getInputProps('phone')}
      />
      <Button mt="md" type="submit">
        Dodaj
      </Button>
    </Stack>
  );
};

export default AddContactForm;
