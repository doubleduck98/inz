import dayjs, { Dayjs } from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { startOfWeekDate } from './Calendar/CalendarUtils';
import { useMediaQuery } from '@mantine/hooks';
import { DaySchedule, WeekSchedule } from './types/Schedule';
import axiosInstance from '../../Axios';
import { Booking } from './types/Booking';
import { Display } from './types/Display';

interface UseCalendar {
  currentDay: Dayjs;
  currentWeek: Dayjs;
  setDate: (date: Dayjs) => void;
  display: Display;
  setDisplay: (display: Display) => void;
  loading: boolean;
  daySchedule: DaySchedule | null;
  weekSchedule: WeekSchedule | null;
  prev: () => void;
  next: () => void;
  setToday: () => void;
}

const useCalendar = (): UseCalendar => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const date = dayjs();
  const [currentDay, setCurrentDate] = useState(date);
  const currentWeek = useMemo(() => startOfWeekDate(currentDay), [currentDay]);
  const [daySchedule, setDaySchedule] = useState<DaySchedule | null>(null);
  const [weekSchedule, setWeekSchedule] = useState<WeekSchedule | null>(null);
  const [display, setCurrentDisplay] = useState<Display>('week');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isMobile) setCurrentDisplay('list');
    else setCurrentDisplay('week');
  }, [isMobile]);

  const fetchSchedule = useCallback(async () => {
    const params =
      display === 'day'
        ? { date: currentDay.format('YYYY-MM-DD') }
        : {
            date: currentWeek.format('YYYY-MM-DD'),
            endDate: currentWeek.endOf('week').format('YYYY-MM-DD'),
          };

    const opts = {
      url: 'Bookings/Get',
      method: 'GET',
      withCredentials: true,
      params: params,
    };

    try {
      setLoading(true);
      const { data } = await axiosInstance.request(opts);
      if (display === 'day') setDaySchedule({ bookings: data });
      else {
        const ws: DaySchedule[] = data.map((l: Booking[]) => {
          return { bookings: l };
        });
        setWeekSchedule({ days: ws });
      }
    } catch (e) {
      console.log(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [currentDay, currentWeek, display]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const setDate = (date: Dayjs) => setCurrentDate(date);
  const setDisplay = (display: Display) => setCurrentDisplay(display);
  const prev = () => {
    const shift = display === 'day' ? 'day' : 'week';
    let newDate = currentDay.subtract(1, shift);
    if (display !== 'day') newDate = startOfWeekDate(newDate);
    setCurrentDate(newDate);
  };
  const next = () => {
    const shift = display === 'day' ? 'day' : 'week';
    let newDate = currentDay.add(1, shift);
    if (display !== 'day') newDate = startOfWeekDate(newDate);
    setCurrentDate(newDate);
  };
  const setToday = () => setCurrentDate(dayjs());

  return {
    currentDay,
    currentWeek,
    setDate,
    display,
    setDisplay,
    loading,
    daySchedule,
    weekSchedule,
    prev,
    next,
    setToday,
  };
};

export default useCalendar;
