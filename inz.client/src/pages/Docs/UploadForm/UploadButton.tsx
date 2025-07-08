import { Button, Progress, rgba, useMantineTheme } from '@mantine/core';
import classes from './UploadButton.module.css';
import { UploadStatus } from '../types/UploadStatus';

interface UploadButtonProps {
  uploadStatus: UploadStatus;
  uploadProgress: number;
  disabled: boolean;
}

const UploadButton = ({
  uploadStatus,
  uploadProgress,
  disabled,
}: UploadButtonProps) => {
  const theme = useMantineTheme();
  return (
    <Button
      type="submit"
      disabled={disabled}
      fullWidth
      className={classes.button}
      color={uploadStatus === 'uploaded' ? 'teal' : theme.primaryColor}
    >
      <div className={classes.label}>
        {uploadStatus === 'uploaded'
          ? 'Przesłano!'
          : uploadStatus === 'uploading'
            ? 'Przesyłanie..'
            : 'Prześlij plik'}
      </div>
      {uploadStatus === 'uploading' && (
        <Progress
          value={uploadProgress}
          className={classes.progress}
          color={rgba(theme.colors.blue[2], 0.35)}
          radius="sm"
        />
      )}
    </Button>
  );
};

export default UploadButton;
