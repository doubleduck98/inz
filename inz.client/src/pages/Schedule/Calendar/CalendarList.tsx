import { Dayjs } from 'dayjs';
import { Stack, Box, Group, Badge, Text, Flex, Skeleton } from '@mantine/core';
import { WeekSchedule } from '../types/WeekSchedule';
import BookingActions from './BookingActions';
import { Booking } from '../types/Booking';
import { IDX_FORMAT } from './Constants';

interface CalendarListProps {
  currentDate: Dayjs;
  weekSchedule: WeekSchedule;
  loading: boolean;
  onEdit: (booking: Booking) => void;
  onDelete: (id: number) => void;
}

const CalendarList = ({
  currentDate,
  weekSchedule,
  loading,
  onEdit,
  onDelete,
}: CalendarListProps) => {
  const start = currentDate.startOf('week');
  const days = Array.from({ length: 5 }, (_, i) => start.add(i, 'day'));
  const SkeletonBooking = () => (
    <Flex justify="space-between" align="center" gap="sm">
      <Flex align="center" gap="sm" miw="0">
        <Skeleton height={28} width={60} radius="sm" />
        <Skeleton height={20} width={200} radius="sm" />
      </Flex>
      <Group gap="xs">
        <Skeleton height={28} width={28} radius="xl" />
      </Group>
    </Flex>
  );
  return (
    <Flex flex={1} align="center" direction="column">
      <Stack gap="xl" mb="lg" w={{ base: '100%', sm: 650 }}>
        {days.map((day, dIdx) => (
          <Box key={dIdx}>
            <Group
              justify="space-between"
              pb="xs"
              style={{
                borderBottom: '1px solid var(--mantine-color-gray-3)',
              }}
            >
              <Text fw={700} size="lg" tt="capitalize">
                {day.format('dddd')}
              </Text>
              <Text size="sm" c="dimmed">
                {day.format('DD MMMM')}
              </Text>
            </Group>
            <Stack mt="sm">
              {loading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <SkeletonBooking key={i} />
                ))
              ) : weekSchedule[day.format(IDX_FORMAT)] ? (
                weekSchedule[day.format(IDX_FORMAT)]
                  .sort((a, b) => a.hour - b.hour)
                  .map((booking, bIdx) => (
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
                      <BookingActions
                        booking={booking}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
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
    </Flex>
  );
};

export default CalendarList;
