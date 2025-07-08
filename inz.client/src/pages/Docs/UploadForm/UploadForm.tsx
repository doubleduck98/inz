import { FileInput, Stack, Textarea } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconFileUpload } from '@tabler/icons-react';
import DocDropzone from './DocDropzone';
import { FileWithPath } from '@mantine/dropzone';
import PatientSelect from '@/components/PatientSelect';
import { useUploadFormContext } from './UploadFormContext';
import UploadButton from './UploadButton';
import { UploadStatus } from '../types/UploadStatus';

interface UploadFormProps {
  uploadStatus: UploadStatus;
  uploadProgress: number;
}

const UploadForm = ({ uploadStatus, uploadProgress }: UploadFormProps) => {
  const form = useUploadFormContext();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const onFileChange = (file: File | null) => {
    if (file) form.setValues({ fileName: file.name, file: file });
    else form.setValues({ file: file });
  };

  return (
    <Stack>
      <PatientSelect
        defaultValue={form.getValues().patientName}
        errorProps={form.getInputProps('patientId').error}
        setPatientValue={(value) => form.setFieldValue('patientName', value)}
        setPatientIdValue={(value) => form.setFieldValue('patientId', value)}
      />
      <Textarea
        label="Nazwa dokumentu:"
        autosize
        maxRows={4}
        {...form.getInputProps('fileName')}
      />
      <FileInput
        leftSection={<IconFileUpload />}
        label="Dokument:"
        placeholder="Nie wybrano pliku"
        {...form.getInputProps('file')}
        clearable
        onChange={onFileChange}
      />

      {!isMobile && (
        <DocDropzone
          onDrop={(f: FileWithPath[]) => {
            onFileChange(f[0]);
          }}
        />
      )}

      <UploadButton
        uploadStatus={uploadStatus}
        uploadProgress={uploadProgress}
        disabled={!form.getValues().file}
      />
    </Stack>
  );
};

export default UploadForm;
