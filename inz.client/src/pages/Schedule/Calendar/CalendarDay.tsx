import { Box, Stack, Text, Flex, LoadingOverlay } from '@mantine/core';
import dayjs, { Dayjs } from 'dayjs';
import classes from './Calendar.module.css';
import BookingCard from './BookingCard';
import { Booking } from '../types/Booking';
import { END_HOUR, HOUR_HEIGHT, START_HOUR } from './Constants';

interface CalendarDayProps {
  date: Dayjs;
  schedule: Booking[];
  loading: boolean;
  onEdit: (booking: Booking) => void;
  onDelete: (id: number) => void;
}

const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) =>
  dayjs()
    .hour(START_HOUR + i)
    .minute(0)
);

const CalendarDay = ({
  date,
  schedule,
  loading,
  onEdit,
  onDelete,
}: CalendarDayProps) => {
  const bookingCards = schedule.map((booking, i) => (
    <BookingCard
      key={i}
      booking={booking}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  ));

  return (
    <Box w={{ sm: 650 }}>
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
          <LoadingOverlay
            visible={loading}
            overlayProps={{ radius: 'md', top: 2, blur: 2 }}
            transitionProps={{
              transition: 'fade',
              duration: 200,
            }}
          />
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
