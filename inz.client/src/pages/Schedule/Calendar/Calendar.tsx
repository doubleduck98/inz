import { Dayjs } from 'dayjs';
import { Booking } from '../types/Booking';
import { WeekSchedule } from '../types/WeekSchedule';
import { Display } from '../types/Display';
import CalendarDay from './CalendarDay';
import CalendarList from './CalendarList';
import CalendarWeek from './CalendarWeek';
import { Box } from '@mantine/core';

interface CalendarProps {
  currentDay: Dayjs;
  currentWeek: Dayjs;
  display: Display;
  daySchedule: Booking[];
  weekSchedule: WeekSchedule;
  loading: boolean;
  onEdit: (booking: Booking) => void;
  onDelete: (id: number) => void;
}

const Calendar = ({
  currentDay,
  currentWeek,
  display,
  daySchedule,
  weekSchedule,
  loading,
  onEdit,
  onDelete,
}: CalendarProps) => {
  return (
    <Box pos="relative">
      {display === 'day' && (
        <CalendarDay
          date={currentDay}
          schedule={daySchedule}
          loading={loading}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}

      {display === 'week' && (
        <CalendarWeek
          currentDate={currentWeek}
          weekSchedule={weekSchedule}
          loading={loading}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}

      {display === 'list' && (
        <CalendarList
          currentDate={currentWeek}
          weekSchedule={weekSchedule}
          loading={loading}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </Box>
  );
};

export default Calendar;
