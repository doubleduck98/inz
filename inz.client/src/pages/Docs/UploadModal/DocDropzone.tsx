import { Group, Button, Text, useMantineTheme } from '@mantine/core';
import { Dropzone, FileWithPath, MIME_TYPES } from '@mantine/dropzone';
import { IconDownload, IconX, IconCloudUpload } from '@tabler/icons-react';
import classes from './DocDropzone.module.css';
import { useRef } from 'react';

interface DocDropzoneProps {
  onDrop: (f: FileWithPath[]) => void;
}

const DocDropzone = ({ onDrop }: DocDropzoneProps) => {
  const theme = useMantineTheme();
  const openRef = useRef<() => void>(null);
  return (
    <div className={classes.wrapper}>
      <Dropzone
        openRef={openRef}
        multiple={false}
        onDrop={onDrop}
        className={classes.dropzone}
        radius="md"
        accept={[MIME_TYPES.pdf, MIME_TYPES.doc, MIME_TYPES.docx, 'text/plain']}
        maxSize={30 * 1024 ** 2}
      >
        <div style={{ pointerEvents: 'none' }}>
          <Group justify="center">
            <Dropzone.Accept>
              <IconDownload
                size={50}
                color={theme.colors.blue[6]}
                stroke={1.5}
              />
            </Dropzone.Accept>
            <Dropzone.Reject>
              <IconX size={50} color={theme.colors.red[6]} stroke={1.5} />
            </Dropzone.Reject>
            <Dropzone.Idle>
              <IconCloudUpload
                size={50}
                stroke={1.5}
                className={classes.icon}
              />
            </Dropzone.Idle>
          </Group>

          <Text ta="center" fw={700} fz="lg" mt="xl">
            <Dropzone.Accept>Upuść plik</Dropzone.Accept>
            <Dropzone.Reject>Tylko pliki MS Word i PDF</Dropzone.Reject>
            <Dropzone.Idle>Prześlij plik</Dropzone.Idle>
          </Text>

          <Text className={classes.description}>Upuść plik, aby przesłać</Text>
        </div>
      </Dropzone>

      <Button
        className={classes.control}
        size="md"
        radius="xl"
        onClick={() => openRef.current?.()}
      >
        Wybierz plik
      </Button>
    </div>
  );
};

export default DocDropzone;
