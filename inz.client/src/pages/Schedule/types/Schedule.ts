import { Booking } from './Booking';

export interface WeekSchedule {
  days: DaySchedule[];
}

export interface DaySchedule {
  bookings: Booking[] | null;
}
