import { ScrollArea, Table } from '@mantine/core';
import { Doc } from '@/types/Doc';
import TableRow from './TableRow';
import TableHeader from './TableHeader';
import TableSkeleton from './DocsTableSkeleton';

interface DocsTableProps {
  docs: Doc[];
  loading: boolean;
  sortedData: Doc[];
  selection: number[];
  toggleRow: (id: number) => void;
  toggleAll: () => void;
  sortBy: keyof Doc | null;
  reverseSortDirection: boolean;
  setSorting: (field: keyof Doc) => void;
  onDownload: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (doc: Doc) => void;
}

const DocsTable = ({
  docs,
  loading,
  sortedData,
  selection,
  toggleRow,
  toggleAll,
  sortBy,
  reverseSortDirection,
  setSorting,
  onDownload,
  onDelete,
  onEdit,
}: DocsTableProps) => {
  const sortedDocs = sortedData.map((doc) => (
    <TableRow
      key={doc.id}
      doc={doc}
      selected={selection.includes(doc.id)}
      onToggle={() => toggleRow(doc.id)}
      onDownload={onDownload}
      onDelete={onDelete}
      onEdit={onEdit}
    />
  ));

  return (
    <ScrollArea.Autosize mah={'85vh'} offsetScrollbars>
      <Table highlightOnHover verticalSpacing="sm" layout="fixed">
        <TableHeader
          docs={docs}
          selection={selection}
          toggleAll={toggleAll}
          sortBy={sortBy}
          reverseSortDirection={reverseSortDirection}
          setSorting={setSorting}
        />
        <Table.Tbody>
          {loading ? (
            <TableSkeleton />
          ) : sortedDocs.length > 0 ? (
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
    </ScrollArea.Autosize>
  );
};

export default DocsTable;
