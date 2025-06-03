import { createFormContext } from '@mantine/form';

interface UploadFormValues {
  file: File | null;
  fileName: string;
  patientId: string | number | null;
}

export const [UploadFormProvider, useUploadFormContext, useUploadForm] =
  createFormContext<UploadFormValues>();
