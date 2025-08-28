import {
  Accordion,
  AccordionPanel,
  Badge,
  Button,
  Center,
  Flex,
  Group,
  List,
  Loader,
  Paper,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { PatientDetails } from './PatientDetails';
import dayjs from 'dayjs';
import {
  IconArrowLeft,
  IconAt,
  IconEdit,
  IconFileText,
  IconHome,
  IconMapPin,
  IconPhone,
  IconUserPlus,
  IconX,
} from '@tabler/icons-react';

interface PatientDetailsDisplayProps {
  onBack: () => void;
  onEdit: () => void;
  onAddContact: () => void;
  patient: PatientDetails | null;
  loading: boolean;
}

const PatientDetailsDisplay = ({
  onBack,
  onEdit,
  onAddContact,
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
      <Group justify="space-between" pt="sm" mb="md" hiddenFrom="sm">
        <Button
          variant="subtle"
          size="compact-md"
          pl="0"
          color="gray"
          onClick={onBack}
        >
          <IconArrowLeft />
        </Button>
        <Button
          variant="subtle"
          size="compact-md"
          color="gray"
          onClick={onEdit}
        >
          <IconEdit />
        </Button>
      </Group>
      {patient && (
        <Stack gap="sm" px={{ base: 0, sm: 'sm' }}>
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
            <Stack gap="xs" visibleFrom="sm">
              <Button variant="subtle" size="md" color="gray" onClick={onBack}>
                <IconX />
              </Button>
              <Button variant="subtle" size="md" color="gray" onClick={onEdit}>
                <IconEdit />
              </Button>
            </Stack>
          </Group>

          {patient.phone && (
            <Flex align="center" gap="sm">
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
            <Flex align="center" gap="sm">
              <IconAt size={28} stroke={1.5} />
              <div>
                <Text size="xs" c="dimmed">
                  E-mail
                </Text>
                <Text size="sm">{patient.email}</Text>
              </div>
            </Flex>
          )}

          <Flex align="flex-start" gap="sm">
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

          <Flex align="flex-start" gap="sm">
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

          <Accordion mt="lg" variant="separated">
            <Accordion.Item value="cts">
              <Accordion.Control>
                <Group gap="sm">
                  <Text hiddenFrom="sm">Kontakty</Text>
                  <Text visibleFrom="sm">Dodatkowe informacje kontaktowe</Text>
                  <Badge circle>
                    {patient.contacts ? patient.contacts.length : '0'}
                  </Badge>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <ScrollArea.Autosize
                  mah={{ base: 200, sm: 320 }}
                  scrollbarSize={8}
                  type="scroll"
                >
                  <Button
                    leftSection={<IconUserPlus />}
                    mb="sm"
                    color="gray"
                    variant="default"
                    visibleFrom="sm"
                    onClick={onAddContact}
                  >
                    Dodaj kontakt
                  </Button>
                  <Stack gap="sm" maw={'96%'}>
                    <Button
                      leftSection={<IconUserPlus />}
                      px="sm"
                      color="gray"
                      variant="default"
                      hiddenFrom="sm"
                      onClick={onAddContact}
                    >
                      Dodaj kontakt
                    </Button>
                    {patient.contacts ? (
                      patient.contacts.map((contact, index) => (
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
                      ))
                    ) : (
                      <Text fz="14" c="dimmed">
                        Brak kontaktów
                      </Text>
                    )}
                  </Stack>
                </ScrollArea.Autosize>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="docs">
              <Accordion.Control>
                <Group gap="sm">
                  Dokumenty
                  <Badge circle>
                    {patient.docs ? patient.docs.length : '0'}
                  </Badge>
                </Group>
              </Accordion.Control>
              <AccordionPanel>
                <ScrollArea.Autosize mah={{ base: 200, sm: 300 }} type="scroll">
                  {patient.docs ? (
                    <List
                      spacing="xs"
                      icon={
                        <ThemeIcon mt={3} variant="light" color="gray">
                          <IconFileText size={18} stroke={1.5} />
                        </ThemeIcon>
                      }
                    >
                      {patient.docs.map((doc) => (
                        <List.Item>
                          <Text fz={{ base: 13, sm: 15 }} lineClamp={2}>
                            {doc}
                          </Text>
                        </List.Item>
                      ))}
                    </List>
                  ) : (
                    <Text fz="14" c="dimmed">
                      Brak dokumentów
                    </Text>
                  )}
                </ScrollArea.Autosize>
              </AccordionPanel>
            </Accordion.Item>
          </Accordion>
        </Stack>
      )}
    </>
  );
};

export default PatientDetailsDisplay;
