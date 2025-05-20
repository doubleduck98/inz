import { ActionIcon, Group, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconDownload, IconTrash } from '@tabler/icons-react';

interface TableRowButtonsProps {
  id: number;
  fileName: string;
  onDelete: (id: number) => void;
}

const TableRowButtons = ({ id, fileName, onDelete }: TableRowButtonsProps) => {
  const handleDownload = () => {
    try {
      window.location.href = `Resources/Download/${id}`;
    } catch (e) {
      console.log(e);
    }
  };

  const handleDelete = (id: number) => {
    modals.openConfirmModal({
      title: 'Potwierdź usunięcie',
      children: (
        <Text size="sm">
          Czy chcesz usunąć{' '}
          {fileName.length > 40 ? fileName.substring(0, 40) + '..' : fileName}?
        </Text>
      ),
      labels: { confirm: 'Usuń', cancel: 'Anuluj' },
      confirmProps: { color: 'red' },
      onConfirm: () => onDelete(id),
    });
  };

  return (
    <Group gap={4}>
      <ActionIcon variant="subtle" color="gray" onClick={handleDownload}>
        <IconDownload size={21} />
      </ActionIcon>
      <ActionIcon
        variant="subtle"
        color="gray"
        onClick={() => handleDelete(id)}
      >
        <IconTrash size={21} />
      </ActionIcon>
    </Group>
  );
};

export default TableRowButtons;
