import { Box, Paper, Stack, Text, Flex } from '@mantine/core';
import dayjs, { Dayjs } from 'dayjs';
import classes from './Calendar.module.css';
import { DaySchedule } from '../types/Schedule';

interface CalendarDayProps {
  date: Dayjs;
  schedule: DaySchedule;
}

const START_HOUR = 8;
const END_HOUR = 17;
const HOUR_HEIGHT = 80;

const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) =>
  dayjs()
    .hour(START_HOUR + i)
    .minute(0)
);

const CalendarDay = ({ date, schedule }: CalendarDayProps) => {
  const bookings = schedule.bookings ?? [];
  const bookingCards = bookings.map((booking, i) => (
    <Paper
      key={i}
      className={classes.booking}
      style={{
        top: (booking.time - START_HOUR) * HOUR_HEIGHT,
      }}
    >
      <Text fw={500} size="sm">
        {booking.patient}
      </Text>
      <Text c="dimmed" size="xs">
        {booking.room}
      </Text>
      <Text c="dimmed" size="xs">
        {booking.time}:00
      </Text>
    </Paper>
  ));

  return (
    <Box>
      <Flex className={classes.header}>
        <Box w={{ base: 40, sm: 60 }} />
        <Flex flex={1}>
          <Text className={classes.headerText}>{date.format('dddd')}</Text>
        </Flex>
      </Flex>

      <Flex>
        <Stack w={{ base: 40, sm: 60 }} align="flex-end" pr="xs" gap={0}>
          {hours.map((hour, index) => (
            <Box key={index} h={HOUR_HEIGHT}>
              <Text className={classes.timeText}>{hour.format('HH:mm')}</Text>
            </Box>
          ))}
        </Stack>

        <Box className={`${classes.dayCol} ${classes.dayColRightBorder}`}>
          {bookingCards}
          <Stack className={classes.hourStack} gap={0}>
            {hours.map((_, index) => (
              <Box key={index} className={classes.hourLine} />
            ))}
          </Stack>
        </Box>
      </Flex>
    </Box>
  );
};

export default CalendarDay;
