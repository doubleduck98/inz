import { createFormContext } from '@mantine/form';

interface UploadFormValues {
  file: File | null;
  fileName: string;
  patientId: string;
}

export const [UploadFormProvider, useUploadFormContext, useUploadForm] =
  createFormContext<UploadFormValues>();
