import { ActionIcon, Group, Menu, MenuItem, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import {
  IconDots,
  IconDownload,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react';

interface TableRowButtonsProps {
  id: number;
  fileName: string;
  onDelete: (id: number) => void;
  onEdit: (id: number, mobile: boolean) => void;
}

const TableRowButtons = ({
  id,
  fileName,
  onDelete,
  onEdit,
}: TableRowButtonsProps) => {
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
    <>
      <Menu withArrow transitionProps={{ transition: 'pop' }}>
        <Menu.Target>
          <ActionIcon variant="subtle" color="gray" hiddenFrom="sm">
            <IconDots size={16} stroke={1.5} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <MenuItem
            leftSection={<IconDownload size={16} />}
            onClick={handleDownload}
          >
            <Text fz="sm" pt="3px">
              Pobierz
            </Text>
          </MenuItem>
          <MenuItem
            leftSection={<IconEdit size={16} />}
            onClick={() => onEdit(id, true)}
          >
            <Text fz="sm" pt="3px">
              Edytuj
            </Text>
          </MenuItem>
          <MenuItem
            leftSection={<IconTrash size={16} />}
            color="red"
            onClick={() => handleDelete(id)}
          >
            <Text fz="sm" pt="3px" c="red">
              Usuń
            </Text>
          </MenuItem>
        </Menu.Dropdown>
      </Menu>

      <Group visibleFrom="sm" gap={3}>
        <ActionIcon variant="subtle" color="gray" onClick={handleDownload}>
          <IconDownload size={21} />
        </ActionIcon>
        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={() => onEdit(id, false)}
        >
          <IconEdit size={21} />
        </ActionIcon>
        <ActionIcon
          variant="subtle"
          color="red"
          onClick={() => handleDelete(id)}
        >
          <IconTrash size={21} />
        </ActionIcon>
      </Group>
    </>
  );
};

export default TableRowButtons;
