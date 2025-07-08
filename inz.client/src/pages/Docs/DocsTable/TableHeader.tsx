import { Table, Checkbox, Text } from '@mantine/core';
import { Doc } from '@/types/Doc';
import TableHeaderButton from './TableHeaderButton';
import { useMediaQuery } from '@mantine/hooks';
import classes from './Docs.module.css';

interface TableHeaderProps {
  docs: Doc[];
  selection: number[];
  toggleAll: () => void;
  sortBy: keyof Doc | null;
  reverseSortDirection: boolean;
  setSorting: (field: keyof Doc) => void;
}

const TableHeader = ({
  docs,
  selection,
  toggleAll,
  sortBy,
  reverseSortDirection,
  setSorting,
}: TableHeaderProps) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <Table.Thead className={classes.tableThead}>
      <Table.Tr>
        <Table.Th w={{ base: '28px', sm: '40px' }} px={{ base: '0', sm: 'sm' }}>
          <Checkbox
            onChange={toggleAll}
            checked={selection.length === docs.length && docs.length > 0}
            indeterminate={
              selection.length > 0 && selection.length < docs.length
            }
          />
        </Table.Th>
        {isMobile ? (
          <>
            <TableHeaderButton
              sorted={sortBy === 'fileName'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('fileName')}
              width="auto"
            >
              Dokument
            </TableHeaderButton>
          </>
        ) : (
          <>
            <TableHeaderButton
              sorted={sortBy === 'fileName'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('fileName')}
              width={'50%'}
            >
              Nazwa
            </TableHeaderButton>
            <TableHeaderButton
              sorted={sortBy === 'patientName'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('patientName')}
              width={'30%'}
            >
              Pacjent
            </TableHeaderButton>
          </>
        )}

        <Table.Th w={{ base: '40px', sm: '120px' }}>
          <Text fw={500} fz="sm">
            {isMobile ? '' : 'Akcje'}
          </Text>
        </Table.Th>
      </Table.Tr>
    </Table.Thead>
  );
};

export default TableHeader;
