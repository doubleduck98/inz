import { Dayjs } from 'dayjs';

export interface Booking {
  id: number;
  hour: number;
  date: Dayjs;
  patientId: number;
  patient: string;
  roomId: number;
  roomName: string;
}
