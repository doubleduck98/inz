import { Table } from '@mantine/core';
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
  onDownload: (id: number) => void;
  onDelete: (id: number) => void;
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
  onDownload,
  onDelete,
}: DocsTableProps) => {
  const sortedDocs = sortedData.map((doc) => (
    <TableRow
      key={doc.id}
      doc={doc}
      selected={selection.includes(doc.id)}
      onToggle={() => toggleRow(doc.id)}
      onDownload={onDownload}
      onDelete={onDelete}
    />
  ));

  return (
    <Table maw={400} verticalSpacing="sm">
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
            <Table.Td colSpan={4} style={{ textAlign: 'center' }}>
              Nie znaleziono dokumentów.
            </Table.Td>
          </Table.Tr>
        )}
      </Table.Tbody>
    </Table>
  );
};

export default DocsTable;
