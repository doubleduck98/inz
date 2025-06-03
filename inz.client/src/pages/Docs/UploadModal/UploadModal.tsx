import { Button, FileInput, Modal, Stack, TextInput } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconFileUpload } from '@tabler/icons-react';
import DocDropzone from './DocDropzone';
import { FileWithPath } from '@mantine/dropzone';
import PatientSelect from './PatientSelect';
import { useUploadFormContext } from '../UploadFormContext';
import { Paitent } from '../../../types/Patient';

interface UploadModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onFileChange: (f: File | null) => void;
  patientsSelect: Paitent[];
  patientsSearch: string;
  patientsLoading: boolean;
  onSearchChange: (s: string) => void;
}

const UploadModal = ({
  opened,
  onClose,
  onSubmit,
  onFileChange,
  patientsSelect,
  patientsSearch,
  patientsLoading,
  onSearchChange,
}: UploadModalProps) => {
  const icon = <IconFileUpload />;
  const form = useUploadFormContext();
  const isMobile = useMediaQuery('(max-width: 768px)');
  return (
    <Modal opened={opened} onClose={onClose} title="Prześlij dokument">
      <form onSubmit={onSubmit}>
        <Stack>
          <PatientSelect
            patients={patientsSelect}
            search={patientsSearch}
            loading={patientsLoading}
            onSearchChange={onSearchChange}
          />
          <TextInput
            label="Nazwa dokumentu:"
            {...form.getInputProps('fileName')}
          />
          <FileInput
            leftSection={icon}
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
      </form>
    </Modal>
  );
};

export default UploadModal;
