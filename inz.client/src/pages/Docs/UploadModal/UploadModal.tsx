import { Button, FileInput, Modal, Stack, TextInput } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { useMediaQuery } from '@mantine/hooks';
import { IconFileUpload } from '@tabler/icons-react';
import DocDropzone from './DocDropzone';
import { FileWithPath } from '@mantine/dropzone';

interface UploadModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  inputProps: UseFormReturnType<FormData>['getInputProps'];
  fileChosen: boolean;
  onFileChange: (f: File | null) => void;
}

const UploadModal = ({
  opened,
  onClose,
  onSubmit,
  inputProps,
  fileChosen,
  onFileChange,
}: UploadModalProps) => {
  const icon = <IconFileUpload />;
  const isMobile = useMediaQuery('(max-width: 768px)');
  return (
    <Modal opened={opened} onClose={onClose} title="Prześlij dokument">
      <form onSubmit={onSubmit}>
        <Stack>
          <TextInput label="Nazwa dokumentu:" {...inputProps('fileName')} />

          <FileInput
            leftSection={icon}
            label="Dokument:"
            placeholder="Nie wybrano pliku"
            {...inputProps('file')}
            clearable
            onChange={onFileChange}
            // disabled={!isMobile}
          />

          {!isMobile && (
            <DocDropzone
              onDrop={(f: FileWithPath[]) => {
                onFileChange(f[0]);
              }}
            />
          )}

          <Button type="submit" disabled={fileChosen}>
            Prześlij plik
          </Button>
        </Stack>
      </form>
    </Modal>
  );
};

export default UploadModal;
