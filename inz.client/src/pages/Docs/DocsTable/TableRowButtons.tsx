import { ActionIcon, ActionIconGroup } from '@mantine/core';
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

  return (
    <ActionIconGroup>
      <ActionIcon variant="subtle" color="gray" onClick={handleDownload}>
        <IconDownload size={21} />
      </ActionIcon>
      <ActionIcon variant="subtle" color="gray" onClick={() => onDelete(id)}>
        <IconTrash size={21} />
      </ActionIcon>
    </ActionIconGroup>
  );
};

export default TableRowButtons;
