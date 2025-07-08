import { Button, SimpleGrid } from '@mantine/core';
import {
  IconCloudUpload,
  IconCloudDownload,
  IconTrashX,
} from '@tabler/icons-react';
import { pliki } from '../utils/TableUtils';
import { useMediaQuery } from '@mantine/hooks';
import { openConfirmDeleteModal } from '@/components/Modals';

interface TableButtonsProps {
  openDialog: () => void;
  selection: number[];
  onDownloadSelection: () => void;
  onDeleteSelection: () => void;
}

const TableButtons = ({
  selection,
  openDialog,
  onDownloadSelection,
  onDeleteSelection,
}: TableButtonsProps) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const handleDeleteSelection = () => {
    openConfirmDeleteModal({
      title: 'Potwierdź usunięcie',
      message: `Czy chcesz usunąć ${selection.length} ${pliki(selection.length)}?`,
      onConfirm: onDeleteSelection,
    });
  };

  return (
    <SimpleGrid cols={{ base: 3, sm: 1 }} spacing="xs">
      <Button
        leftSection={isMobile ? undefined : <IconCloudUpload />}
        rightSection={isMobile ? undefined : <span />}
        variant="gradient"
        onClick={openDialog}
        justify={isMobile ? 'center' : 'space-between'}
      >
        Prześlij
      </Button>
      <Button
        leftSection={isMobile ? undefined : <IconCloudDownload />}
        rightSection={isMobile ? undefined : <span />}
        variant="default"
        disabled={selection.length === 0}
        justify={isMobile ? 'center' : 'space-between'}
        onClick={onDownloadSelection}
      >
        Pobierz
      </Button>
      <Button
        leftSection={isMobile ? undefined : <IconTrashX />}
        rightSection={isMobile ? undefined : <span />}
        color="red"
        variant="light"
        disabled={selection.length === 0}
        justify={isMobile ? 'center' : 'space-between'}
        onClick={handleDeleteSelection}
      >
        Usuń
      </Button>
    </SimpleGrid>
  );
};

export default TableButtons;
