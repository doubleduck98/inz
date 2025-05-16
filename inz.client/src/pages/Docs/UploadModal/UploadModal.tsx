import { Button, FileInput, Modal, Stack, TextInput } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { useMediaQuery } from '@mantine/hooks';
import { IconFileUpload } from '@tabler/icons-react';
import Dropzone from './Dropzone';

interface UploadModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  inputProps: UseFormReturnType<FormData>['getInputProps'];
  submitDisabled: boolean;
  onFileChange: (f: File | null) => void;
}

const UploadModal = ({
  opened,
  onClose,
  onSubmit,
  inputProps,
  submitDisabled,
  onFileChange,
}: UploadModalProps) => {
  const icon = <IconFileUpload />;
  const isMobile = useMediaQuery('(min-width: 768px)');
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Prześlij dokument"
      fullScreen={!isMobile}
    >
      <form onSubmit={onSubmit}>
        <Stack>
          <TextInput label="Test" {...inputProps('fileName')} />
          {isMobile ? (
            <Dropzone />
          ) : (
            <FileInput
              leftSection={icon}
              label="test input"
              placeholder="Nie wybrano pliku"
              {...inputProps('file')}
              clearable
              onChange={onFileChange}
            />
          )}
          <Button type="submit" disabled={submitDisabled}>
            Prześlij plik
          </Button>
        </Stack>
      </form>
    </Modal>
  );
};

export default UploadModal;
