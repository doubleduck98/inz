import { createFormContext } from '@mantine/form';
import { Dayjs } from 'dayjs';

export interface AddFormValues {
  patientId: number | null;
  roomId: number | null;
  dates: Dayjs[];
  bookings: Record<string, number | null>;

  patient: string;
  room: string;
}

export const [AddFormProvider, useAddFormContext, useAddForm] =
  createFormContext<AddFormValues>();
