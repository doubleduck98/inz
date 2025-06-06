import { createFormContext } from '@mantine/form';

interface EditFormValues {
  fileId: number;
  fileName: string;
  patientId: string;
  patientName: string;
}

export const [EditFormProvider, useEditFormContext, useEditForm] =
  createFormContext<EditFormValues>();
