import { Button, FileInput, Stack, TextInput } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconFileUpload } from '@tabler/icons-react';
import DocDropzone from './DocDropzone';
import { FileWithPath } from '@mantine/dropzone';
import PatientSelect from '../components/PatientSelect';
import { useUploadFormContext } from './UploadFormContext';
import { Paitent } from '../../../types/Patient';

interface UploadFormProps {
  onFileChange: (f: File | null) => void;
  patientsSelect: Paitent[];
  patientsLoading: boolean;
  onSearchChange: (s: string) => void;
}

const UploadForm = ({
  onFileChange,
  patientsSelect,
  patientsLoading,
  onSearchChange,
}: UploadFormProps) => {
  const form = useUploadFormContext();
  const isMobile = useMediaQuery('(max-width: 768px)');
  return (
    <Stack>
      <PatientSelect
        patients={patientsSelect}
        loading={patientsLoading}
        onSearchChange={onSearchChange}
        form={form}
      />
      <TextInput label="Nazwa dokumentu:" {...form.getInputProps('fileName')} />
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

      <Button type="submit" disabled={!form.getValues().file}>
        Prześlij plik
      </Button>
    </Stack>
  );
};

export default UploadForm;
