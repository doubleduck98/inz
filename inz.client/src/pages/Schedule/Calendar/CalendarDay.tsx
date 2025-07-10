import { Box, Stack, Text, Flex, LoadingOverlay } from '@mantine/core';
import dayjs, { Dayjs } from 'dayjs';
import classes from './Calendar.module.css';
import BookingCard from './BookingCard';
import { Booking } from '../types/Booking';
import { END_HOUR, START_HOUR, TIME_PL } from './Constants';
import { useMediaQuery } from '@mantine/hooks';

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
  const isMobile = useMediaQuery('(max-width: 768px)');
  return (
    <Flex flex={1} align="center" direction="column">
      <Flex className={classes.header}>
        <Flex flex={1} justify="center" pl={isMobile ? TIME_PL / 2 : TIME_PL}>
          <Text className={classes.headerText}>{date.format('dddd')}</Text>
        </Flex>
      </Flex>

      <Flex w={{ base: '100%', sm: 500 }} pl={isMobile ? TIME_PL / 2 : TIME_PL}>
        <Box className={`${classes.dayCol} ${classes.dayColRightBorder}`}>
          <LoadingOverlay
            visible={loading}
            overlayProps={{ radius: 'md', top: 2, blur: 2 }}
            transitionProps={{
              transition: 'fade',
              duration: 200,
            }}
          />
          {schedule.map((booking, i) => (
            <BookingCard
              key={i}
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
                data-hour={hour.format('HH:mm')}
              />
            ))}
          </Stack>
        </Box>
      </Flex>
    </Flex>
  );
};

export default CalendarDay;
