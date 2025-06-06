import { Box, Checkbox, Group, Stack, Table, Text } from '@mantine/core';
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
  onEdit: (id: number, mobile: boolean) => void;
}

const TableRow = ({
  doc,
  selected,
  onToggle,
  onDelete,
  onEdit,
}: TableRowProps) => {
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
      <Table.Td px={{ base: '0', sm: 'sm' }}>
        <Checkbox checked={selected} onChange={onToggle} />
      </Table.Td>

      <Table.Td hiddenFrom="sm">
        <Group wrap="nowrap" gap="xs">
          <Box miw={26} maw={26} visibleFrom="sm">
            {ExToIcon(doc.fileName)}
          </Box>
          <Stack gap={0} style={{ overflow: 'hidden', flexGrow: 1 }}>
            <Text fw={500} lineClamp={2} fz="sm">
              {doc.fileName}
            </Text>
            <Text c="dimmed" lineClamp={2} fz="xs">
              {doc.patientName}
            </Text>
          </Stack>
        </Group>
      </Table.Td>

      <Table.Td visibleFrom="sm">
        <Group wrap="nowrap" gap="sm" align="center">
          <Box miw={26} maw={26} pt="8px">
            {ExToIcon(doc.fileName)}
          </Box>
          <Text
            fw={500}
            fz="md"
            lineClamp={2}
            style={{ flexGrow: 1, overflow: 'hidden' }}
          >
            {doc.fileName}
          </Text>
        </Group>
      </Table.Td>
      <Table.Td visibleFrom="sm">
        <Text lineClamp={2} fz="md">
          {doc.patientName}
        </Text>
      </Table.Td>

      <Table.Td p={{ base: 'xs', sm: 'sm' }}>
        <TableRowButtons
          id={doc.id}
          fileName={doc.fileName}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      </Table.Td>
    </Table.Tr>
  );
};

export default TableRow;
