import { Dayjs } from 'dayjs';
import { Stack, Box, Group, Badge, Text, Flex } from '@mantine/core';
import { WeekSchedule } from '../types/Schedule';
import BookingActions from './BookingActions';

interface CalendarListProps {
  currentDate: Dayjs;
  weekSchedule: WeekSchedule | null;
}

const CalendarList = ({ currentDate, weekSchedule }: CalendarListProps) => {
  const daySchedules = weekSchedule?.days ?? [];
  return (
    <Stack gap="xl" mb="lg">
      {daySchedules.map((day, dIdx) => (
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
                <Flex
                  key={bIdx}
                  justify="space-between"
                  align="center"
                  gap="sm"
                >
                  <Flex align="center" gap="sm" miw="0">
                    <Badge
                      size="lg"
                      color="gray"
                      variant="light"
                      style={{ flexShrink: 0 }}
                    >
                      {booking.hour}:00
                    </Badge>
                    <Text size="sm" lineClamp={3}>
                      {booking.patient} - {booking.roomName}
                    </Text>
                  </Flex>
                  <BookingActions />
                </Flex>
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
