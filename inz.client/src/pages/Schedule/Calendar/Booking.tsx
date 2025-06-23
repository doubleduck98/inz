import { Paper, Text } from '@mantine/core';
import { Booking } from '../types/Booking';
import BookingActions from './BookingActions';
import classes from './Calendar.module.css';

interface BookingCardProps {
  booking: Booking;
}

const START_HOUR = 8;
const HOUR_HEIGHT = 80;

const BookingCard = ({ booking }: BookingCardProps) => {
  return (
    <Paper
      className={classes.booking}
      style={{
        top: (booking.hour - START_HOUR) * HOUR_HEIGHT,
      }}
    >
      <Text fw={500} size="sm">
        {booking.patient}
      </Text>
      <Text c="dimmed" size="xs">
        {booking.roomName}
      </Text>
      <Text c="dimmed" size="xs">
        {booking.hour}:00
      </Text>
      <BookingActions className={classes.bookingActionIcon} />
    </Paper>
  );
};

export default BookingCard;
