import { Box, Checkbox, Group, Stack, Table, Text } from '@mantine/core';
import { Doc } from '@/types/Doc';
import {
  IconFileTypePdf,
  IconFileText,
  IconFileTypeDoc,
  IconFileTypeTxt,
  IconFileTypeDocx,
} from '@tabler/icons-react';
import TableRowButtons from './TableRowButtons';
import { useMediaQuery } from '@mantine/hooks';
import React from 'react';

interface TableRowProps {
  doc: Doc;
  selected: boolean;
  onToggle: () => void;
  onDownload: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (doc: Doc) => void;
}

const fileIcons: { [key: string]: React.ReactNode } = {
  pdf: <IconFileTypePdf size={26} radius={26} />,
  doc: <IconFileTypeDoc size={26} radius={26} />,
  docx: <IconFileTypeDocx size={26} radius={26} />,
  txt: <IconFileTypeTxt size={26} radius={26} />,
};

const TableRow = ({
  doc,
  selected,
  onToggle,
  onDownload,
  onDelete,
  onEdit,
}: TableRowProps) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const exToIcon = (fileName: string) => {
    const ex = fileName.split('.').pop();
    const icon = fileIcons[ex!];
    return icon || <IconFileText size={26} radius={26} />;
  };

  return (
    <Table.Tr key={doc.id}>
      <Table.Td px={{ base: '0', sm: 'sm' }}>
        <Checkbox checked={selected} onChange={onToggle} />
      </Table.Td>

      {isMobile && (
        <Table.Td>
          <Stack gap={0}>
            <Text fw={500} lineClamp={2} fz="sm">
              {doc.fileName}
            </Text>
            <Text c="dimmed" fz="xs">
              {doc.patientName}
            </Text>
          </Stack>
        </Table.Td>
      )}

      {!isMobile && (
        <>
          <Table.Td>
            <Group wrap="nowrap" gap="sm" align="center">
              <Box miw={26} maw={26} pt="8px">
                {exToIcon(doc.fileName)}
              </Box>
              <Text fw={500} fz="md" lineClamp={2}>
                {doc.fileName}
              </Text>
            </Group>
          </Table.Td>
          <Table.Td>
            <Text lineClamp={2} fz="md">
              {doc.patientName}
            </Text>
          </Table.Td>
        </>
      )}

      <Table.Td p={{ base: 'xs', sm: 'sm' }}>
        <TableRowButtons
          doc={doc}
          onDownload={onDownload}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      </Table.Td>
    </Table.Tr>
  );
};

export default TableRow;
