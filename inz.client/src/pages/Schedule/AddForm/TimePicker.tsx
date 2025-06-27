import { Center, Group, Loader, Paper, Text } from '@mantine/core';
import { TimeGrid } from '@mantine/dates';
import { IconAlertTriangle } from '@tabler/icons-react';
import { Dayjs } from 'dayjs';
import { END_HOUR, START_HOUR } from '../Calendar/Constants';

interface TimePickerProps {
  loading: boolean;
  onTimeSelect: (date: Dayjs, time: string) => void;
  date: Dayjs;
  availableHours: number[];
  errorMessage?: string;
}

const hours = Array.from(
  { length: END_HOUR - START_HOUR },
  (_, i) => START_HOUR + i
);

const TimePicker = ({
  loading,
  onTimeSelect,
  date,
  availableHours,
  errorMessage,
}: TimePickerProps) => {
  const handleTimeClick = (value: string | null) => {
    if (value) onTimeSelect(date, value);
  };
  const data = hours.map((hr) => `${hr}:00`);
  const disabled = hours
    .filter((hr) => !availableHours.includes(hr))
    .map((hr) => `${hr}:00`);

  return (
    <Paper withBorder p="md" radius="md" mt="md">
      <Text ta="center" fw={500} mb="md">
        {date.format('DD MMMM YYYY')}
      </Text>
      {loading ? (
        <Center h="7em">
          <Loader />
        </Center>
      ) : (
        <>
          <TimeGrid
            data={data}
            disableTime={disabled}
            onChange={handleTimeClick}
          />
        </>
      )}
      {errorMessage && (
        <Group
          justify="center"
          pt="xs"
          style={{ color: 'var(--mantine-color-red-8)' }}
        >
          <IconAlertTriangle size={18} />
          <Text fz={{ base: 14, sm: 16 }}>{errorMessage}</Text>
        </Group>
      )}
    </Paper>
  );
};

export default TimePicker;
