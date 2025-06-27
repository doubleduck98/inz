import { createFormContext } from '@mantine/form';

export interface EditFormValues {
  id: number;
  patientId: number | null;
  roomId: number | null;

  patient: string;
  room: string;
}

export const [EditFormProvider, useEditFormContext, useEditForm] =
  createFormContext<EditFormValues>();
