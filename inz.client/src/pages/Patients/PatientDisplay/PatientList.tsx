import {
  Box,
  Stack,
  Button,
  Text,
  TextInput,
  ScrollArea,
  List,
  Paper,
  ListItem,
  CloseButton,
  Skeleton,
  Group,
} from '@mantine/core';
import { IconUserCheck, IconUser } from '@tabler/icons-react';
import { Paitent } from '@/types/Patient';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';

interface PatientListProps {
  openDialog: () => void;
  patients: Paitent[];
  loading: boolean;
  onPatientClick: (patient: Paitent) => void;
  selectedPatientId: number | null;
}

const PatientList = ({
  openDialog,
  patients,
  loading,
  onPatientClick,
  selectedPatientId,
}: PatientListProps) => {
  const [search, setSearch] = useState('');
  const filteredPatients2 = useMemo(
    () =>
      search.length > 0
        ? patients.filter(
            (p) =>
              p.name.toLowerCase().startsWith(search.toLowerCase()) ||
              p.surname.toLowerCase().startsWith(search.toLowerCase())
          )
        : patients,
    [patients, search]
  );

  return (
    <Box miw={280} py="sm">
      <Stack gap="md">
        <Button variant="gradient" onClick={openDialog}>
          Dodaj pacjenta
        </Button>
        <TextInput
          placeholder="Wyszukaj.."
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          rightSection={
            search && (
              <CloseButton
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setSearch('');
                }}
              />
            )
          }
        />
        <ScrollArea.Autosize mah="75vh" overscrollBehavior="contain">
          {loading ? (
            <Stack gap="xs">
              {Array.from({ length: 12 }).map((_, index) => (
                <Paper withBorder key={index} p="sm">
                  <Group align="center" gap="md">
                    <Skeleton height={28} circle width={28} />
                    <Skeleton height={20} width="75%" radius="sm" />
                  </Group>
                </Paper>
              ))}
            </Stack>
          ) : (
            <List spacing="xs" size="sm" center>
              {filteredPatients2.map((patient) => (
                <Paper key={patient.id} withBorder mt="xs">
                  <ListItem
                    onClick={() => onPatientClick(patient)}
                    style={{ cursor: 'pointer' }}
                    p="sm"
                    bg={selectedPatientId === patient.id ? 'blue' : undefined}
                    icon={
                      selectedPatientId === patient.id ? (
                        <IconUserCheck />
                      ) : (
                        <IconUser />
                      )
                    }
                  >
                    <Text lineClamp={3}>
                      {patient.name} {patient.surname} (
                      {dayjs().diff(patient.dob, 'year')} l.)
                    </Text>
                  </ListItem>
                </Paper>
              ))}
              {filteredPatients2.length === 0 && (
                <Text c="dimmed">Nie znaleziono osób</Text>
              )}
            </List>
          )}
        </ScrollArea.Autosize>
      </Stack>
    </Box>
  );
};

export default PatientList;
