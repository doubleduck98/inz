import { Box, Stack, Text, Flex } from '@mantine/core';
import dayjs, { Dayjs } from 'dayjs';
import classes from './Calendar.module.css';
import { WeekSchedule } from '../types/Schedule';
import BookingCard from './Booking';

interface CalendarWeekProps {
  currentDate: Dayjs;
  weekSchedule: WeekSchedule | null;
}

const START_HOUR = 8;
const END_HOUR = 17;

const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) =>
  dayjs()
    .hour(START_HOUR + i)
    .minute(0)
);

const CalendarWeek = ({ currentDate, weekSchedule }: CalendarWeekProps) => {
  const start = currentDate.startOf('week');
  const daySchedules = weekSchedule?.days ?? [];
  const days = Array.from({ length: 5 }, (_, i) => start.add(i, 'day'));

  return (
    <Box>
      <Flex className={classes.header}>
        <Box className={classes.time} />
        <Flex flex={1}>
          {days.map((d) => (
            <Text key={d.format()} className={classes.headerText}>
              {d.format('dddd')}
            </Text>
          ))}
        </Flex>
      </Flex>

      <Flex>
        <Stack className={classes.time} align="flex-end" gap={0}>
          {hours.map((hour, i) => (
            <Box key={i} className={classes.timeHr}>
              <Text className={classes.timeText}>{hour.format('HH:mm')}</Text>
            </Box>
          ))}
        </Stack>

        <Flex flex={1}>
          {days.map((_, i) => {
            const dayBookings = daySchedules[i];
            if (!dayBookings) return;
            const bookingCards = dayBookings.bookings.map((booking, idx) => (
              <BookingCard key={idx} booking={booking} />
            ));

            return (
              <Box
                key={i}
                className={`${classes.dayCol} ${i === days.length - 1 ? classes.dayColRightBorder : ''}`}
              >
                {bookingCards}
                <Stack className={classes.hourStack} gap={0}>
                  {hours.map((_, index) => (
                    <Box key={index} className={classes.hourLine} />
                  ))}
                </Stack>
              </Box>
            );
          })}
        </Flex>
      </Flex>
    </Box>
  );
};

export default CalendarWeek;
