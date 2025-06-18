import { Dayjs } from 'dayjs';
import { Stack, Box, Group, Badge, Text } from '@mantine/core';
import { WeekSchedule } from '../types/Schedule';

interface CalendarListProps {
  currentDate: Dayjs;
  weekSchedule: WeekSchedule;
}

const CalendarList = ({ currentDate, weekSchedule }: CalendarListProps) => {
  return (
    <Stack gap="xl" mb="lg">
      {weekSchedule.days.map((day, dIdx) => (
        <Box key={dIdx}>
          <Group
            justify="space-between"
            pb="xs"
            style={{
              borderBottom: '1px solid var(--mantine-color-gray-3)',
            }}
          >
            <Text fw={700} size="lg" tt="capitalize">
              {currentDate.add(dIdx, 'day').format('dddd')}
            </Text>
            <Text size="sm" c="dimmed">
              {currentDate.add(dIdx, 'day').format('DD MMMM')}
            </Text>
          </Group>
          <Stack mt="sm">
            {day.bookings && day.bookings.length ? (
              day.bookings.map((booking, bIdx) => (
                <Box key={bIdx}>
                  <Group hiddenFrom="sm">
                    <Text size="sm" lineClamp={3} span>
                      <Badge color="gray" size="lg" mr="sm">
                        {booking.time}:00
                      </Badge>
                      {booking.patient} - {booking.room}
                    </Text>
                  </Group>
                  <Group visibleFrom="sm">
                    <Badge color="gray" size="lg">
                      {booking.time}:00
                    </Badge>
                    <Text truncate>
                      {booking.patient} - {booking.room}
                    </Text>
                  </Group>
                </Box>
              ))
            ) : (
              <Text c="dimmed" fs="italic" pl="lg">
                Brak zajęć.
              </Text>
            )}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
};

export default CalendarList;
