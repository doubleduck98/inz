import { ScrollArea, Table } from '@mantine/core';
import { Doc } from '../../../types/Doc';
import TableRow from './TableRow';
import TableHeader from './TableHeader';

interface DocsTableProps {
  docs: Doc[];
  sortedData: Doc[];
  selection: number[];
  toggleRow: (id: number) => void;
  toggleAll: () => void;
  sortBy: keyof Doc | null;
  reverseSortDirection: boolean;
  setSorting: (field: keyof Doc) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, mobile: boolean) => void;
}

const DocsTable = ({
  docs,
  sortedData,
  selection,
  toggleRow,
  toggleAll,
  sortBy,
  reverseSortDirection,
  setSorting,
  onDelete,
  onEdit,
}: DocsTableProps) => {
  const sortedDocs = sortedData.map((doc) => (
    <TableRow
      key={doc.id}
      doc={doc}
      selected={selection.includes(doc.id)}
      onToggle={() => toggleRow(doc.id)}
      onDelete={onDelete}
      onEdit={onEdit}
    />
  ));

  return (
    <ScrollArea>
      <Table verticalSpacing="sm" miw={{ base: 280, sm: 700 }} layout="fixed">
        <TableHeader
          docs={docs}
          selection={selection}
          toggleAll={toggleAll}
          sortBy={sortBy}
          reverseSortDirection={reverseSortDirection}
          setSorting={setSorting}
        />
        <Table.Tbody>
          {sortedDocs.length > 0 ? (
            sortedDocs
          ) : (
            <Table.Tr>
              <Table.Td colSpan={3} style={{ textAlign: 'center' }}>
                Nie znaleziono dokumentów.
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
};

export default DocsTable;
