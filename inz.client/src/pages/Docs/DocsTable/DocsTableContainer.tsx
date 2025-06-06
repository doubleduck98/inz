import { useCallback } from 'react';
import useDocsTable from '../hooks/useDocsTable';
import TableButtons from './TableButtons';
import { Container, Box, Grid, TextInput, CloseButton } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import DocsTable from './DocsTable';
import { Doc } from '../../../types/Doc';

interface DocsTableContainerProps {
  docs: Doc[];
  onDelete: (id: number) => Promise<void>;
  onEdit: (id: number) => void;
  openUploadDialog: () => void;
  onDownloadSelection: (ids: number[]) => Promise<void>;
  onDeleteSelection: (ids: number[]) => Promise<void>;
}

const DocsTableContainer = ({
  docs,
  onDelete,
  onEdit,
  openUploadDialog,
  onDownloadSelection,
  onDeleteSelection,
}: DocsTableContainerProps) => {
  const {
    sortedData,
    search,
    handleSearchChange,
    handleSearchClear,
    sortBy,
    setSorting,
    reverseSortDirection,
    selection,
    toggleRow,
    toggleAll,
    clearSelection,
  } = useDocsTable({ docs: docs });

  const handleDownloadSelection = useCallback(async () => {
    await onDownloadSelection(selection);
  }, [selection, onDownloadSelection]);

  const handleDeleteSelection = useCallback(async () => {
    await onDeleteSelection(selection);
    clearSelection();
  }, [selection, onDeleteSelection, clearSelection]);

  const tableButtons = (
    <TableButtons
      selection={selection}
      openModal={openUploadDialog}
      openDrawer={openUploadDialog}
      onDownloadSelection={handleDownloadSelection}
      onDeleteSelection={handleDeleteSelection}
    />
  );

  return (
    <Container fluid>
      <Box hiddenFrom="sm" my={12}>
        {tableButtons}
      </Box>

      <Grid overflow="hidden">
        <Grid.Col span="auto" order={{ base: 2, sm: 1 }}>
          <TextInput
            placeholder="Wyszukaj po dowolnym polu"
            mb="md"
            leftSection={<IconSearch size={16} stroke={1.5} />}
            value={search}
            onChange={handleSearchChange}
            rightSection={
              <CloseButton
                aria-label="Clear input"
                onClick={handleSearchClear}
                style={{ display: search ? undefined : 'none' }}
              />
            }
          />
          <DocsTable
            docs={docs}
            sortedData={sortedData}
            selection={selection}
            toggleRow={toggleRow}
            toggleAll={toggleAll}
            sortBy={sortBy}
            reverseSortDirection={reverseSortDirection}
            setSorting={setSorting}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        </Grid.Col>
        <Grid.Col
          span={{ base: 12, sm: 'content' }}
          miw={150}
          order={{ base: 1, sm: 2 }}
          visibleFrom="sm"
        >
          {tableButtons}
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default DocsTableContainer;
