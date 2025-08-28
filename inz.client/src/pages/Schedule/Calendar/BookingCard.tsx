import { Paper, Text } from '@mantine/core';
import { Booking } from '../types/Booking';
import BookingActions from './BookingActions';
import classes from './Calendar.module.css';
import { START_HOUR } from './Constants';

interface BookingCardProps {
  booking: Booking;
  onEdit: (booking: Booking) => void;
  onDelete: (id: number) => void;
}

const HOUR_HEIGHT = 80;

const BookingCard = ({ booking, onEdit, onDelete }: BookingCardProps) => {
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
      <BookingActions
        booking={booking}
        className={classes.bookingActionIcon}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </Paper>
  );
};

export default BookingCard;
