import { createFormContext } from '@mantine/form';

interface EditFormValues {
  fileId: number;
  fileName: string;
  patientId: number | null;
  patientName: string | null;
}

export const [EditFormProvider, useEditFormContext, useEditForm] =
  createFormContext<EditFormValues>();
