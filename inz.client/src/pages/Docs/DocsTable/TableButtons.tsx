import { Stack, Button, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import {
  IconCloudUpload,
  IconCloudDownload,
  IconTrashX,
} from '@tabler/icons-react';
import { pliki } from '../utils/TableUtils';

interface TableButtonsProps {
  openModal: () => void;
  selection: number[];
  onDownloadSelection: () => void;
  onDeleteSelection: () => void;
}

const TableButtons = ({
  selection,
  openModal,
  onDownloadSelection,
  onDeleteSelection,
}: TableButtonsProps) => {
  const handleDeleteSelection = () => {
    modals.openConfirmModal({
      title: 'Potwierdź usunięcie',
      children: (
        <Text size="sm">
          Czy chcesz usunąć {selection.length} {pliki(selection.length)}?
        </Text>
      ),
      labels: { confirm: 'Usuń', cancel: 'Anuluj' },
      confirmProps: { color: 'red' },
      onConfirm: () => onDeleteSelection(),
    });
  };

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
        onClick={onDownloadSelection}
      >
        Pobierz
      </Button>
      <Button
        leftSection={<IconTrashX />}
        rightSection={<span />}
        variant="default"
        disabled={selection.length === 0}
        justify="space-between"
        onClick={handleDeleteSelection}
      >
        Usuń
      </Button>
    </Stack>
  );
};

export default TableButtons;
