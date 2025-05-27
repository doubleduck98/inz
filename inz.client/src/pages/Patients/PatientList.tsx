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
} from '@mantine/core';
import { IconUserCheck, IconUser } from '@tabler/icons-react';
import { Paitent } from '../../types/Patient';
import dayjs from 'dayjs';

interface PatientListProps {
  openModal?: () => void;
  openDrawer?: () => void;
  searchTerm: string;
  onSearchChange: React.ChangeEventHandler<HTMLInputElement> | undefined;
  filteredPatients: Paitent[];
  onPatientClick: (patient: Paitent) => void;
  selectedPatientId: number | null;
}

const PatientList = ({
  openModal,
  openDrawer,
  searchTerm,
  onSearchChange,
  filteredPatients,
  onPatientClick,
  selectedPatientId,
}: PatientListProps) => {
  return (
    <Box
      p="sm"
      miw="10rem"
      maw="22rem"
      mah="100vh"
      style={{ overflowY: 'hidden' }}
    >
      <Stack gap="md">
        <Button onClick={openDrawer} hiddenFrom="sm">
          Dodaj pacjenta
        </Button>
        <Button onClick={openModal} visibleFrom="sm">
          Dodaj pacjenta
        </Button>
        <TextInput
          placeholder="Wyszukaj.."
          value={searchTerm}
          onChange={onSearchChange}
        />
        <ScrollArea.Autosize
          mah="75vh"
          scrollbarSize="5"
          overscrollBehavior="contain"
        >
          <List spacing="xs" size="sm" center>
            {filteredPatients.map((patient) => (
              <Paper withBorder mt="xs">
                <ListItem
                  key={patient.id}
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
            {filteredPatients.length === 0 && (
              <Text c="dimmed">Nie znaleziono osób</Text>
            )}
          </List>
        </ScrollArea.Autosize>
      </Stack>
    </Box>
  );
};

export default PatientList;
