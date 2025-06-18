import { Box, Paper, Stack, Text, Flex } from '@mantine/core';
import dayjs, { Dayjs } from 'dayjs';
import classes from './Calendar.module.css';
import { WeekSchedule } from '../types/Schedule';

interface CalendarWeekProps {
  currentDate: Dayjs;
  weekSchedule: WeekSchedule;
}

const START_HOUR = 8;
const END_HOUR = 17;
const HOUR_HEIGHT = 80;

const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) =>
  dayjs()
    .hour(START_HOUR + i)
    .minute(0)
);

const CalendarWeek = ({ currentDate, weekSchedule }: CalendarWeekProps) => {
  const start = currentDate.startOf('week');
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
          {days.map((d, i) => {
            const dayBookings = weekSchedule.days[i] || [];
            const bookingCards = dayBookings.bookings!.map((booking, i) => {
              return (
                <Paper
                  key={i}
                  className={classes.booking}
                  style={{
                    top: (booking.time - START_HOUR) * HOUR_HEIGHT,
                  }}
                >
                  <Text fw={500} size="sm" truncate>
                    {booking.patient}
                  </Text>
                  <Text c="dimmed" size="xs" truncate>
                    {booking.room}
                  </Text>
                  <Text c="dimmed" size="xs" truncate>
                    {booking.time}:00
                  </Text>
                </Paper>
              );
            });

            return (
              <Box
                key={d.format()}
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
