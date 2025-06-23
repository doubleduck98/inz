import { Box, Stack, Text, Flex } from '@mantine/core';
import dayjs, { Dayjs } from 'dayjs';
import classes from './Calendar.module.css';
import BookingCard from './Booking';
import { DaySchedule } from '../types/Schedule';

interface CalendarDayProps {
  date: Dayjs;
  schedule: DaySchedule | null;
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
  const bookings = schedule?.bookings ?? [];
  const bookingCards = bookings.map((booking, i) => (
    <BookingCard key={i} booking={booking} />
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
