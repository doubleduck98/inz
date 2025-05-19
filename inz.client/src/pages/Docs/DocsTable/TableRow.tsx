import { Checkbox, Group, Table } from '@mantine/core';
import { Doc } from '../../../types/Doc';
import {
  IconFileTypePdf,
  IconFileText,
  IconFileTypeDoc,
  IconFileTypeTxt,
  IconFileTypeDocx,
} from '@tabler/icons-react';
import TableRowButtons from './TableRowButtons';

interface TableRowProps {
  doc: Doc;
  selected: boolean;
  onToggle: () => void;
  onDelete: (id: number) => void;
}

const TableRow = ({ doc, selected, onToggle, onDelete }: TableRowProps) => {
  const ExToIcon = (fileName: string) => {
    switch (fileName.split('.').pop()) {
      case 'pdf':
        return <IconFileTypePdf size={26} radius={26} />;
      case 'doc':
        return <IconFileTypeDoc size={26} radius={26} />;
      case 'docx':
        return <IconFileTypeDocx size={26} radius={26} />;
      case 'txt':
        return <IconFileTypeTxt size={26} radius={26} />;
      default:
        return <IconFileText size={26} radius={26} />;
    }
  };

  return (
    <Table.Tr key={doc.id}>
      <Table.Td>
        <Checkbox checked={selected} onChange={onToggle} />
      </Table.Td>
      <Table.Td>
        <Group gap="sm" wrap="nowrap">
          {ExToIcon(doc.fileName)}
          {doc.fileName}
        </Group>
      </Table.Td>
      <Table.Td>{doc.fileType}</Table.Td>
      <Table.Td>
        <TableRowButtons
          id={doc.id}
          fileName={doc.fileName}
          onDelete={onDelete}
        />
      </Table.Td>
    </Table.Tr>
  );
};

export default TableRow;
