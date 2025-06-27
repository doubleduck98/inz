import { Booking } from './Booking';

export interface WeekSchedule {
  [date: string]: Booking[];
}
