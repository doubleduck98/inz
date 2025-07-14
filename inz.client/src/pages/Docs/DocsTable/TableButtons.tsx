import { Button, SimpleGrid } from '@mantine/core';
import {
  IconCloudUpload,
  IconCloudDownload,
  IconTrashX,
  IconTrash,
} from '@tabler/icons-react';
import { pliki } from '../utils/TableUtils';
import { openConfirmDeleteModal } from '@/components/Modals';

interface TableButtonsProps {
  openDialog: () => void;
  openTrash: () => void;
  selection: number[];
  onDownloadSelection: () => void;
  onDeleteSelection: () => void;
}

const TableButtons = ({
  selection,
  openDialog,
  openTrash,
  onDownloadSelection,
  onDeleteSelection,
}: TableButtonsProps) => {
  const handleDeleteSelection = () => {
    openConfirmDeleteModal({
      title: 'Potwierdź usunięcie',
      message: `Czy chcesz usunąć ${selection.length} ${pliki(selection.length)}?`,
      onConfirm: onDeleteSelection,
    });
  };

  return (
    <SimpleGrid cols={{ base: 2, sm: 1 }} spacing="xs">
      <Button
        leftSection={<IconCloudUpload />}
        rightSection={<span />}
        variant="gradient"
        onClick={openDialog}
        justify="space-between"
      >
        Prześlij
      </Button>
      <Button
        leftSection={<IconTrash />}
        rightSection={<span />}
        variant="light"
        color="gray"
        onClick={openTrash}
        justify="space-between"
      >
        Kosz
      </Button>
      <Button
        leftSection={<IconCloudDownload />}
        rightSection={<span />}
        variant="light"
        color="gray"
        disabled={selection.length === 0}
        justify="space-between"
        onClick={onDownloadSelection}
      >
        Pobierz
      </Button>
      <Button
        leftSection={<IconTrashX />}
        rightSection={<span />}
        color="red"
        variant="light"
        disabled={selection.length === 0}
        justify="space-between"
        onClick={handleDeleteSelection}
      >
        Usuń
      </Button>
    </SimpleGrid>
  );
};

export default TableButtons;
