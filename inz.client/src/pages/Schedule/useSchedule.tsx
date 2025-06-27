import dayjs, { Dayjs } from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { startOfWeekDate } from './Calendar/CalendarUtils';
import { useMediaQuery } from '@mantine/hooks';
import { WeekSchedule } from './types/WeekSchedule';
import axiosInstance from '../../Axios';
import { Booking } from './types/Booking';
import { Display } from './types/Display';
import { AddFormValues } from './AddForm/AddFormContext';
import { EditFormValues } from './EditForm/EditFormContext';

interface UseSchedule {
  currentDay: Dayjs;
  currentWeek: Dayjs;
  setDate: (date: Dayjs) => void;
  display: Display;
  setDisplay: (display: Display) => void;
  loading: boolean;
  daySchedule: Booking[];
  weekSchedule: WeekSchedule;
  addBooking: (values: AddFormValues) => Promise<void>;
  editBooking: (values: EditFormValues) => Promise<void>;
  deleteBooking: (id: number) => Promise<void>;
  prev: () => void;
  next: () => void;
  setToday: () => void;
}

const IDX_FORMAT = 'YYYY-MM-DD';

const useSchedule = (): UseSchedule => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const date = dayjs();
  const [currentDay, setCurrentDate] = useState(date);
  const currentWeek = useMemo(() => startOfWeekDate(currentDay), [currentDay]);
  const [daySchedule, setDaySchedule] = useState<Booking[]>([]);
  const [weekSchedule, setWeekSchedule] = useState<WeekSchedule>({});
  const [display, setCurrentDisplay] = useState<Display>('week');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isMobile) setCurrentDisplay('list');
    else setCurrentDisplay('week');
  }, [isMobile]);

  const fetchSchedule = useCallback(async () => {
    const params =
      display === 'day'
        ? { date: currentDay.format(IDX_FORMAT) }
        : {
            date: currentWeek.format(IDX_FORMAT),
            endDate: currentWeek.endOf('week').format(IDX_FORMAT),
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
      if (display === 'day') setDaySchedule(data);
      else setWeekSchedule(data);
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [currentDay, currentWeek, display]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const updateAddBooking = (newBookings: Booking[]) => {
    if (display === 'day') {
      const nb = newBookings.find((b) =>
        dayjs(b.date).isSame(currentDay, 'day')
      );
      if (!nb) return;
      setDaySchedule((prev) => [...prev, nb]);
    } else {
      const nb = newBookings
        .filter((b) => dayjs(b.date).isSame(currentWeek, 'week'))
        .reduce((acc, booking) => {
          acc[dayjs(booking.date).format(IDX_FORMAT)] = [booking];
          return acc;
        }, {} as WeekSchedule);
      if (!nb || Object.entries(nb).length === 0) return;
      setWeekSchedule((prev) => {
        const newSchedule = { ...prev };
        for (const date in nb) {
          if (newSchedule[date])
            newSchedule[date] = [...newSchedule[date], ...nb[date]];
          else newSchedule[date] = nb[date];
        }
        return newSchedule;
      });
    }
  };

  const addBooking = async (values: AddFormValues) => {
    const opts = {
      url: `Bookings/Create`,
      method: 'POST',
      withCredentials: true,
      data: {
        bookings: values.bookings,
        patientId: values.patientId,
        roomId: values.roomId,
      },
    };

    const { data } = await axiosInstance.request(opts);
    updateAddBooking(data);
  };

  const updateEditBooking = (values: EditFormValues) => {
    if (display === 'day') {
      const nbs = daySchedule.map((b) => {
        if (b.id === values.id) {
          return {
            ...b,
            patient: values.patient,
            patientId: values.patientId,
            roomName: values.room,
            roomId: values.roomId,
          } as Booking;
        } else return b;
      });
      setDaySchedule(nbs);
    } else {
      setWeekSchedule((prev) => {
        const ns = { ...prev };
        for (const date in ns) {
          ns[date] = ns[date].map((b) => {
            if (b.id === values.id) {
              return {
                ...b,
                patient: values.patient,
                patientId: values.patientId,
                roomName: values.room,
                roomId: values.roomId,
              } as Booking;
            } else return b;
          });
        }
        return ns;
      });
    }
  };

  const editBooking = async (values: EditFormValues) => {
    const opts = {
      url: `Bookings/Edit/${values.id}`,
      method: 'PUT',
      withCredentials: true,
      data: {
        patientId: values.patientId,
        roomId: values.roomId,
      },
    };

    await axiosInstance.request(opts);
    updateEditBooking(values);
  };

  const updateDeleteBooking = (id: number) => {
    if (display === 'day') {
      setDaySchedule((prev) => prev.filter((b) => b.id !== id));
    } else {
      setWeekSchedule((prev) => {
        const ns = { ...prev };
        for (const date in ns) {
          ns[date] = ns[date].filter((b) => b.id !== id);
          if (ns[date].length === 0) {
            delete ns[date];
          }
        }
        return ns;
      });
    }
  };

  const deleteBooking = async (id: number) => {
    const opts = {
      url: `Bookings/Delete/${id}`,
      method: 'DELETE',
      withCredentials: true,
    };

    await axiosInstance.request(opts);
    updateDeleteBooking(id);
  };

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
    addBooking,
    editBooking,
    deleteBooking,
    prev,
    next,
    setToday,
  };
};

export default useSchedule;
