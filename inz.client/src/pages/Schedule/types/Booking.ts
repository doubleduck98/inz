import { Dayjs } from 'dayjs';

export interface Booking {
  id: number;
  hour: number;
  date: Dayjs;
  patient: string;
  roomName: string;
}
