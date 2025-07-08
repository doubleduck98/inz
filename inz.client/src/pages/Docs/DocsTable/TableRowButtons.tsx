import { openConfirmDeleteModal } from '@/components/Modals';
import { Doc } from '@/types/Doc';
import { ActionIcon, Group, Menu, MenuItem, Text } from '@mantine/core';
import {
  IconDots,
  IconDownload,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react';

interface TableRowButtonsProps {
  doc: Doc;
  onDownload: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (doc: Doc) => void;
}

const TableRowButtons = ({
  doc,
  onDownload,
  onDelete,
  onEdit,
}: TableRowButtonsProps) => {
  const handleDelete = (id: number) => {
    openConfirmDeleteModal({
      title: 'Potwierdź usunięcie',
      message: `Czy chcesz usunąć ${
        doc.fileName.length > 40
          ? doc.fileName.substring(0, 40) + '..'
          : doc.fileName
      }?`,
      onConfirm: () => onDelete(id),
    });
  };

  return (
    <>
      <Menu
        withArrow
        position="bottom-end"
        transitionProps={{ transition: 'pop' }}
      >
        <Menu.Target>
          <ActionIcon variant="subtle" color="gray" hiddenFrom="sm">
            <IconDots size={16} stroke={1.5} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <MenuItem
            leftSection={<IconDownload size={16} />}
            onClick={() => onDownload(doc.id)}
          >
            <Text fz="sm" pt="3px">
              Pobierz
            </Text>
          </MenuItem>
          <MenuItem
            leftSection={<IconEdit size={16} />}
            onClick={() => onEdit(doc)}
          >
            <Text fz="sm" pt="3px">
              Edytuj
            </Text>
          </MenuItem>
          <MenuItem
            leftSection={<IconTrash size={16} />}
            color="red"
            onClick={() => handleDelete(doc.id)}
          >
            <Text fz="sm" pt="3px" c="red">
              Usuń
            </Text>
          </MenuItem>
        </Menu.Dropdown>
      </Menu>

      <Group visibleFrom="sm" gap={3}>
        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={() => onDownload(doc.id)}
        >
          <IconDownload size={21} />
        </ActionIcon>
        <ActionIcon variant="subtle" color="gray" onClick={() => onEdit(doc)}>
          <IconEdit size={21} />
        </ActionIcon>
        <ActionIcon
          variant="subtle"
          color="red"
          onClick={() => handleDelete(doc.id)}
        >
          <IconTrash size={21} />
        </ActionIcon>
      </Group>
    </>
  );
};

export default TableRowButtons;
