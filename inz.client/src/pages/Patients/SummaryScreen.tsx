import { Box, Divider, Text, Group } from '@mantine/core';
import { PatientFormValues } from './patientFormContext';
import dayjs from 'dayjs';

interface SummaryScreenProps {
  data: PatientFormValues;
}

const SummaryScreen = ({ data }: SummaryScreenProps) => {
  return (
    <Box miw={'100%'} m={0} p="xs">
      <Text size="xl" fw={700} mb="sm" ta="center">
        Podsumowanie
      </Text>

      <Divider my="sm" label="Dane Osobowe" labelPosition="center" />
      <Group mb="xs" wrap="nowrap" justify="space-between">
        <Text fw={500} size="sm" style={{ flexShrink: 0 }}>
          Imię i Nazwisko:
        </Text>
        <Text size="sm" ta="right" style={{ flexGrow: 1 }} lineClamp={2}>
          {data.name} {data.surname}
        </Text>
      </Group>
      <Group mb="xs" wrap="nowrap" justify="space-between">
        <Text fw={500} size="sm" style={{ flexShrink: 0 }}>
          Data Urodzenia:
        </Text>
        <Text size="sm" ta="right" style={{ flexGrow: 1 }}>
          {dayjs(data.dob).format('LL')}
        </Text>
      </Group>

      <Divider my="md" label="Adres" labelPosition="center" />
      <Group mb="xs" wrap="nowrap" justify="space-between">
        <Text fw={500} size="sm" style={{ flexShrink: 0 }}>
          Ulica i Numer:
        </Text>
        <Text size="sm" ta="right" style={{ flexGrow: 1 }} lineClamp={2}>
          {data.street} {data.house}
          {data.apartment ? `/${data.apartment}` : ''}
        </Text>
      </Group>
      <Group mb="xs" wrap="nowrap" justify="space-between">
        <Text fw={500} size="sm" style={{ flexShrink: 0 }}>
          Kod Pocztowy i Miasto:
        </Text>
        <Text size="sm" ta="right" style={{ flexGrow: 1 }} lineClamp={2}>
          {data.zipCode} {data.city}
        </Text>
      </Group>
      <Group mb="xs" wrap="nowrap" justify="space-between">
        <Text fw={500} size="sm" style={{ flexShrink: 0 }}>
          Województwo:
        </Text>
        <Text size="sm" ta="right" style={{ flexGrow: 1 }}>
          {data.province}
        </Text>
      </Group>

      <Divider my="md" label="Dane Kontaktowe" labelPosition="center" />
      {data.patientContact.email && (
        <Group mb="xs" wrap="nowrap" justify="space-between">
          <Text fw={500} size="sm" style={{ flexShrink: 0 }}>
            E-mail:
          </Text>
          <Text size="sm" ta="right" style={{ flexGrow: 1 }} lineClamp={2}>
            {data.patientContact.email}
          </Text>
        </Group>
      )}
      {data.patientContact.phone && (
        <Group mb="xs" wrap="nowrap" justify="space-between">
          <Text fw={500} size="sm" style={{ flexShrink: 0 }}>
            Telefon:
          </Text>
          <Text size="sm" ta="right" style={{ flexGrow: 1 }}>
            {data.patientContact.phone}
          </Text>
        </Group>
      )}

      {data.hasContacts && (
        <>
          <Divider my="md" label="Dane Kontaktowe" labelPosition="center" />
          {data.contacts.map((contact, i) => (
            <Box key={contact.key} mb="md">
              <Text fw={600} size="sm" mb="xs">
                Kontakt {i + 1}:
              </Text>
              <Group mb="xs" wrap="nowrap" justify="space-between">
                <Text fw={500} size="sm" style={{ flexShrink: 0 }}>
                  Nazwa:
                </Text>
                <Text
                  size="sm"
                  ta="right"
                  style={{ flexGrow: 1 }}
                  lineClamp={2}
                >
                  {contact.contactName}
                </Text>
              </Group>
              {contact.email && (
                <Group mb="xs" wrap="nowrap" justify="space-between">
                  <Text fw={500} size="sm" style={{ flexShrink: 0 }}>
                    E-mail:
                  </Text>
                  <Text
                    size="sm"
                    ta="right"
                    style={{ flexGrow: 1 }}
                    lineClamp={2}
                  >
                    {contact.email}
                  </Text>
                </Group>
              )}
              {contact.phone && (
                <Group wrap="nowrap" justify="space-between">
                  <Text fw={500} size="sm" style={{ flexShrink: 0 }}>
                    Telefon:
                  </Text>
                  <Text size="sm" ta="right" style={{ flexGrow: 1 }}>
                    {contact.phone}
                  </Text>
                </Group>
              )}
              {i < data.contacts!.length - 1 && (
                <Divider variant="dotted" my="sm" />
              )}
            </Box>
          ))}
        </>
      )}
    </Box>
  );
};

export default SummaryScreen;
