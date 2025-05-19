import { Stack, Button } from '@mantine/core';
import {
  IconCloudUpload,
  IconCloudDownload,
  IconTrashX,
} from '@tabler/icons-react';

interface TableButtonsProps {
  openModal: () => void;
  selection: number[];
  onDeleteSelection: () => void;
}

const TableButtons = ({
  selection,
  openModal,
  onDeleteSelection,
}: TableButtonsProps) => {
  return (
    <Stack gap="xs">
      <Button
        leftSection={<IconCloudUpload />}
        rightSection={<span />}
        variant="default"
        onClick={openModal}
        justify="space-between"
        h={{ base: 60, sm: 36 }}
      >
        Wyślij
      </Button>
      <Button
        leftSection={<IconCloudDownload />}
        rightSection={<span />}
        variant="default"
        disabled={selection.length === 0}
        justify="space-between"
      >
        Pobierz
      </Button>
      <Button
        leftSection={<IconTrashX />}
        rightSection={<span />}
        variant="default"
        disabled={selection.length === 0}
        justify="space-between"
        onClick={onDeleteSelection}
      >
        Usuń
      </Button>
    </Stack>
  );
};

export default TableButtons;
