import { Button, Grid, Select, Stack, TextInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import dayjs from 'dayjs';
import { useEditFormContext } from './EditFormContext';
import { Provinces } from '../utils/FormUtils';

const EditForm = () => {
  const form = useEditFormContext();
  return (
    <Stack>
      <TextInput
        label="Imię"
        placeholder="Imię"
        required
        {...form.getInputProps('name')}
      />
      <TextInput
        label="Nazwisko"
        placeholder="Nazwisko"
        required
        {...form.getInputProps('surname')}
      />
      <DatePickerInput
        label="Data urodzenia"
        placeholder="Data urodzenia"
        valueFormat="DD MMMM YYYY"
        maxDate={dayjs().format()}
        required
        {...form.getInputProps('dob')}
        clearable
      />
      <TextInput
        label="Ulica"
        placeholder="Nazwa ulicy"
        required
        {...form.getInputProps('street')}
      />
      <Grid>
        <Grid.Col span={6}>
          <TextInput
            label="Numer domu"
            placeholder="np. 69, 71/42"
            required
            {...form.getInputProps('house')}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput
            label="Numer mieszkania"
            placeholder="Np. 71, m.4"
            {...form.getInputProps('apartment')}
          />
        </Grid.Col>
      </Grid>
      <Grid>
        <Grid.Col span={5}>
          <TextInput
            label="Kod pocztowy"
            placeholder="Np. 39-400"
            required
            {...form.getInputProps('zipCode')}
          />
        </Grid.Col>
        <Grid.Col span={7}>
          <Select
            label="Województwo"
            placeholder="Wybierz województwo"
            required
            clearable
            searchable
            nothingFoundMessage="Nie znaleziono"
            pointer={true}
            data={Provinces}
            {...form.getInputProps('province')}
          />
        </Grid.Col>
      </Grid>
      <TextInput
        label="Miasto"
        placeholder="Nazwa miasta"
        required
        {...form.getInputProps('city')}
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
      <Button mt="md" type="submit" disabled={!form.isDirty()}>
        Zaktualizuj
      </Button>
    </Stack>
  );
};

export default EditForm;
