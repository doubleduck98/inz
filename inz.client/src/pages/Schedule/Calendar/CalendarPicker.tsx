import { useState } from 'react';
import { Calendar } from '@mantine/dates';
import { isInWeekRange, beginningOfWeek } from './CalendarUtils';
import dayjs, { Dayjs } from 'dayjs';

interface WeekCalendarProps {
  date: string;
  setDate: (date: Dayjs) => void;
  display: 'day' | 'week' | 'list';
}

const CalendarPicker = ({ date, setDate, display }: WeekCalendarProps) => {
  const [hovered, setHovered] = useState<string | null>(null);

  if (display === 'day')
    return (
      <Calendar
        withCellSpacing={false}
        defaultDate={date}
        getDayProps={(d) => {
          return {
            selected: dayjs(d).isSame(date, 'day'),
            onClick: () => setDate(dayjs(d)),
          };
        }}
      />
    );

  return (
    <Calendar
      withCellSpacing={false}
      defaultDate={date}
      getDayProps={(d) => {
        const isHovered = isInWeekRange(d, hovered);
        const isSelected = isInWeekRange(d, date);
        const isInRange = isHovered || isSelected;
        return {
          onMouseEnter: () => setHovered(d),
          onMouseLeave: () => setHovered(null),
          inRange: isInRange,
          firstInRange: isInRange && new Date(d).getDay() === 1,
          lastInRange: isInRange && new Date(d).getDay() === 0,
          selected: isSelected,
          onClick: () => setDate(beginningOfWeek(d)),
        };
      }}
    />
  );
};

export default CalendarPicker;
