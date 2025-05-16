import { Table, Checkbox } from '@mantine/core';
import { Doc } from '../../../types/Doc';
import TableHeaderButton from './TableHeaderButton';

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
  return (
    <Table.Thead>
      <Table.Tr>
        <Table.Th w={40}>
          <Checkbox
            onChange={toggleAll}
            checked={selection.length === docs.length && docs.length > 0}
            indeterminate={
              selection.length > 0 && selection.length < docs.length
            }
          />
        </Table.Th>
        <TableHeaderButton
          sorted={sortBy === 'fileName'}
          reversed={reverseSortDirection}
          onSort={() => setSorting('fileName')}
        >
          Nazwa
        </TableHeaderButton>
        <TableHeaderButton
          sorted={sortBy === 'fileType'}
          reversed={reverseSortDirection}
          onSort={() => setSorting('fileType')}
        >
          Typ
        </TableHeaderButton>
      </Table.Tr>
    </Table.Thead>
  );
};

export default TableHeader;
