import {
  Stepper,
  Group,
  Button,
  Box,
  TextInput,
  Stack,
  Grid,
  Select,
  Fieldset,
  CloseButton,
  Flex,
  Switch,
} from '@mantine/core';
import classes from '../Patients.module.css';
import { IconArrowLeft, IconUserPlus } from '@tabler/icons-react';
import { DatePickerInput } from '@mantine/dates';
import React from 'react';
import dayjs from 'dayjs';
import { useAddFormContext } from './AddFormContext';
import { randomId } from '@mantine/hooks';
import AddFormSummary from './AddFormSummary';
import { Provinces } from '../utils/FormUtils';

interface AddFormProps {
  active: number;
  setActive: React.Dispatch<React.SetStateAction<number>>;
}

const AddForm = ({ active, setActive }: AddFormProps) => {
  const form = useAddFormContext();
  const hasContacts = form.getValues().hasContacts;
  const toggleHasContacts = () =>
    form.setFieldValue('hasContacts', !hasContacts);
  const trySetActive = (i: number) => {
    if (i < active) setActive(i);
  };
  const nextStep = () =>
    setActive((current) => {
      if (form.validate().hasErrors) {
        return current;
      }
      return current < 3 ? current + 1 : current;
    });

  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));

  const handleAddContact = () =>
    form.insertListItem('contacts', {
      contactName: '',
      email: '',
      phone: '',
      key: randomId(),
    });

  const contactInputs = form.getValues().contacts?.map((contact, i) => (
    <Box key={contact.key} mt="md">
      <Fieldset legend={`Kontakt ${i + 1}`} style={{ position: 'relative' }}>
        {i > 0 && (
          <CloseButton
            style={{ position: 'absolute' }}
            top={-2}
            right={15}
            onClick={() => form.removeListItem('contacts', i)}
          />
        )}
        <TextInput
          label="Nazwa"
          placeholder="np. Rodzic"
          withAsterisk
          key={form.key(`contacts.${i}.name`)}
          {...form.getInputProps(`contacts.${i}.contactName`)}
        />
        <TextInput
          mt="sm"
          label="Adres e-mail"
          placeholder="jan.kowalski@gmail.com"
          type="email"
          key={form.key(`contacts.${i}.email`)}
          {...form.getInputProps(`contacts.${i}.email`)}
        />
        <TextInput
          mt="sm"
          label="Numer telefonu"
          placeholder="+48 781 287 515"
          key={form.key(`contacts.${i}.phone`)}
          {...form.getInputProps(`contacts.${i}.phone`)}
        />
      </Fieldset>
    </Box>
  ));

  return (
    <Box>
      <Stepper
        active={active}
        onStepClick={trySetActive}
        wrap={false}
        pt={12}
        classNames={{ root: classes.root, stepLabel: classes.stepLabel }}
      >
        <Stepper.Step label="Dane">
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
          </Stack>
        </Stepper.Step>

        <Stepper.Step label="Adres">
          <TextInput
            label="Ulica"
            placeholder="Nazwa ulicy"
            required
            {...form.getInputProps('street')}
          />
          <Grid mt="md">
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
                mt="md"
                label="Kod pocztowy"
                placeholder="Np. 39-400"
                required
                {...form.getInputProps('zipCode')}
              />
            </Grid.Col>
            <Grid.Col span={7}>
              <Select
                mt="md"
                label="Województwo"
                placeholder="Wybierz województwo"
                required
                clearable
                searchable
                nothingFoundMessage="Nie znaleziono.."
                pointer={true}
                data={Provinces}
                {...form.getInputProps('province')}
              />
            </Grid.Col>
          </Grid>
          <TextInput
            mt="md"
            label="Miasto"
            placeholder="Nazwa miasta"
            required
            {...form.getInputProps('city')}
          />
        </Stepper.Step>

        <Stepper.Step label="Kontakt">
          <Switch
            label="Osoba pełnoletnia/samodzielna"
            checked={!hasContacts}
            onChange={toggleHasContacts}
            mt={12}
          />
          {!hasContacts ? (
            <>
              <TextInput
                mt="md"
                label="Adres e-mail"
                placeholder="jan.kowalski@gmail.com"
                type="email"
                {...form.getInputProps('patientContact.email')}
              />
              <TextInput
                mt="md"
                label="Numer telefonu"
                placeholder="+48 781 287 515"
                {...form.getInputProps('patientContact.phone')}
              />
            </>
          ) : (
            <>
              {contactInputs}
              <Flex justify={'flex-end'}>
                <Button
                  leftSection={<IconUserPlus />}
                  rightSection={<span />}
                  mt={'sm'}
                  color="gray"
                  variant="subtle"
                  onClick={handleAddContact}
                >
                  Dodaj kontakt
                </Button>
              </Flex>
            </>
          )}
        </Stepper.Step>

        <Stepper.Completed>
          <AddFormSummary data={form.getValues()} />
        </Stepper.Completed>
      </Stepper>
      <Group justify="center" mt="xl" grow preventGrowOverflow={false}>
        <Button
          variant="default"
          onClick={prevStep}
          disabled={active === 0}
          maw={'15%'}
          p={2}
        >
          <IconArrowLeft />
        </Button>
        {active < 3 ? (
          <Button onClick={nextStep}>Dalej</Button>
        ) : (
          <Button type="submit" key={randomId()}>
            Wyślj
          </Button>
        )}
      </Group>
    </Box>
  );
};

export default AddForm;
