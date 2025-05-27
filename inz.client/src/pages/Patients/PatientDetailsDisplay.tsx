import {
  Accordion,
  Button,
  Center,
  Flex,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
} from '@mantine/core';
import { PatientDetails } from './PatientDetails';
import dayjs from 'dayjs';
import {
  IconArrowLeft,
  IconAt,
  IconEdit,
  IconHome,
  IconMapPin,
  IconPhone,
  IconX,
} from '@tabler/icons-react';

interface PatientDetailsDisplayProps {
  onBack: () => void;
  patient: PatientDetails | null;
  loading: boolean;
}

const PatientDetailsDisplay = ({
  onBack,
  patient,
  loading,
}: PatientDetailsDisplayProps) => {
  if (loading)
    return (
      <Center h="80vh">
        <Loader></Loader>
      </Center>
    );

  return (
    <>
      <Group justify="space-between" pt="sm" hiddenFrom="sm">
        <Button color="gray" variant="subtle" p={8} onClick={onBack} mb="md">
          <IconArrowLeft />
        </Button>
        <Button variant="subtle" p={8} color="gray" mb="md">
          <IconEdit> /</IconEdit>
        </Button>
      </Group>
      {patient && (
        <Stack gap="sm" px="sm">
          <Group justify="space-between">
            <Flex direction="column" align="flex-start" mb="lg">
              <Text fw={700} fz="xl" ta="center">
                {patient.name} {patient.surname}
              </Text>
              <Text c="dimmed" fz="sm">
                Data urodzenia: {dayjs(patient.dob).format('DD-MM-YYYY')} (
                {dayjs().diff(patient.dob, 'year')} lat)
              </Text>
            </Flex>
            <Stack gap={0} visibleFrom="sm">
              <Button color="gray" variant="subtle" p={8} onClick={onBack}>
                <IconX />
              </Button>
              <Button variant="subtle" p={8} color="gray" mb="md">
                <IconEdit> /</IconEdit>
              </Button>
            </Stack>
          </Group>

          {patient.phone && (
            <Flex
              align="center"
              gap="sm"
              style={{ borderRadius: 'var(--mantine-radius-md)' }}
            >
              <IconPhone size={28} stroke={1.5} />
              <div>
                <Text size="sm" c="dimmed">
                  Telefon
                </Text>
                <Text size="sm">{patient.phone}</Text>
              </div>
            </Flex>
          )}

          {patient.email && (
            <Flex
              align="center"
              gap="sm"
              style={{ borderRadius: 'var(--mantine-radius-md)' }}
            >
              <IconAt size={28} stroke={1.5} />
              <div>
                <Text size="xs" c="dimmed">
                  E-mail
                </Text>
                <Text size="sm">{patient.email}</Text>
              </div>
            </Flex>
          )}

          <Flex
            align="flex-start"
            gap="sm"
            style={{ borderRadius: 'var(--mantine-radius-md)' }}
          >
            <IconMapPin size={28} stroke={1.5} style={{ marginTop: 6 }} />
            <div>
              <Text size="xs" c="dimmed">
                Adres
              </Text>
              <Text size="sm">
                ul. {patient.street} {patient.house}
                {patient.apartment && `/${patient.apartment}`}
              </Text>
            </div>
          </Flex>

          <Flex
            align="flex-start"
            gap="sm"
            style={{ borderRadius: 'var(--mantine-radius-md)' }}
          >
            <IconHome size={28} stroke={1.5} style={{ marginTop: 6 }} />
            <div>
              <Text size="xs" c="dimmed">
                Miasto
              </Text>
              <Text size="sm">
                {patient.zipCode} {patient.city}, woj. {patient.province}
              </Text>
            </div>
          </Flex>

          <Accordion mt="lg">
            {patient.contacts && (
              <Accordion.Item value="cts">
                <Accordion.Control>Informacje kontaktowe</Accordion.Control>
                <Accordion.Panel>
                  <Flex direction="column" gap="sm">
                    {patient.contacts.map((contact, index) => (
                      <Paper key={index} withBorder p="sm">
                        <Text fw={500} size="md" mb="xs">
                          {contact.name}
                        </Text>
                        {contact.email && (
                          <Flex align="center" gap="xs">
                            <IconAt size={22} stroke={1.5} />
                            <div>
                              <Text size="xs" c="dimmed">
                                E-mail
                              </Text>
                              <Text size="sm">{contact.email}</Text>
                            </div>
                          </Flex>
                        )}
                        {contact.phone && (
                          <Flex
                            align="center"
                            gap="xs"
                            mt={contact.email ? 'xs' : undefined}
                          >
                            <IconPhone size={22} stroke={1.5} />
                            <div>
                              <Text size="xs" c="dimmed">
                                Telefon
                              </Text>
                              <Text size="sm">{contact.phone}</Text>
                            </div>
                          </Flex>
                        )}
                      </Paper>
                    ))}
                  </Flex>
                </Accordion.Panel>
              </Accordion.Item>
            )}

            <Accordion.Item value="docs">
              <Accordion.Control>Dokumnety placeholder</Accordion.Control>
              <Accordion.Panel>cf</Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Stack>
      )}
    </>
  );
};

export default PatientDetailsDisplay;
