import { Checkbox, Group, Table } from '@mantine/core';
import { Doc } from '../../../types/Doc';
import { IconFileTypePdf, IconDownload, IconTrash } from '@tabler/icons-react';

interface TableRowProps {
  doc: Doc;
  selected: boolean;
  onToggle: () => void;
  onDownload: (id: number) => void;
  onDelete: (id: number) => void;
}

const TableRow = ({
  doc,
  selected,
  onToggle,
  onDownload,
  onDelete,
}: TableRowProps) => {
  return (
    <Table.Tr key={doc.id}>
      <Table.Td>
        <Checkbox checked={selected} onChange={onToggle} />
      </Table.Td>
      <Table.Td>
        <Group gap="sm">
          <IconFileTypePdf size={26} radius={26} />
          {doc.fileName}
        </Group>
      </Table.Td>
      <Table.Td>{doc.fileType}</Table.Td>
      <Table.Td>
        <Group>
          <IconDownload onClick={() => onDownload(doc.id)} />
          <IconTrash onClick={() => onDelete(doc.id)} />
        </Group>
      </Table.Td>
    </Table.Tr>
  );
};

export default TableRow;
