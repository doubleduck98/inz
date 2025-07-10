import { Box, Stack, Text, Flex, LoadingOverlay, Group } from '@mantine/core';
import dayjs, { Dayjs } from 'dayjs';
import classes from './Calendar.module.css';
import { WeekSchedule } from '../types/WeekSchedule';
import BookingCard from './BookingCard';
import { Booking } from '../types/Booking';
import {
  END_HOUR,
  HOUR_HEIGHT,
  IDX_FORMAT,
  START_HOUR,
  TIME_PL,
} from './Constants';

interface CalendarWeekProps {
  currentDate: Dayjs;
  weekSchedule: WeekSchedule;
  loading: boolean;
  onEdit: (booking: Booking) => void;
  onDelete: (id: number) => void;
}

const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) =>
  dayjs()
    .hour(START_HOUR + i)
    .minute(0)
);

const CalendarWeek = ({
  currentDate,
  weekSchedule,
  loading,
  onEdit,
  onDelete,
}: CalendarWeekProps) => {
  const start = currentDate.startOf('week');
  const days = Array.from({ length: 5 }, (_, i) => start.add(i, 'day'));

  return (
    <Flex flex={1} direction="column">
      <Flex className={classes.header}>
        <Group justify="space-between" w="100%" pl={TIME_PL}>
          {days.map((d) => (
            <Text key={d.format()} className={classes.headerText}>
              {d.format('dddd')} {d.format('DD.MM')}
            </Text>
          ))}
        </Group>
      </Flex>
      <Box pl={TIME_PL}>
        <Flex flex={1} pos="relative">
          <LoadingOverlay
            visible={loading}
            overlayProps={{
              radius: 'md',
              top: 2,
              left: 2,
              right: 2,
              blur: 2,
              bottom: HOUR_HEIGHT,
            }}
            transitionProps={{
              transition: 'fade',
              duration: 150,
            }}
          />
          {days.map((date, i) => {
            const daySchedule = weekSchedule[date.format(IDX_FORMAT)] || [];
            return (
              <Box
                key={i}
                className={`${classes.dayCol} ${i === days.length - 1 ? classes.dayColRightBorder : ''}`}
              >
                {daySchedule.map((booking, idx) => (
                  <BookingCard
                    key={idx}
                    booking={booking}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
                <Stack gap={0}>
                  {hours.map((hour, index) => (
                    <Box
                      key={index}
                      className={classes.hourLine}
                      data-hour={i === 0 ? hour.format('HH:mm') : undefined}
                    />
                  ))}
                </Stack>
              </Box>
            );
          })}
        </Flex>
      </Box>
    </Flex>
  );
};

export default CalendarWeek;
