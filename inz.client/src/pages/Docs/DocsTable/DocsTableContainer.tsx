import useDocsTable from '../hooks/useDocsTable';
import TableButtons from './TableButtons';
import { Container, Box, Grid, TextInput, CloseButton } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import DocsTable from './DocsTable';
import { Doc } from '@/types/Doc';
import classes from './Docs.module.css';

interface DocsTableContainerProps {
  docs: Doc[];
  loading: boolean;
  onDelete: (id: number) => Promise<void>;
  onEdit: (doc: Doc) => void;
  onDownload: (id: number) => void;
  onDownloadSelection: (ids: number[]) => void;
  openUploadDialog: () => void;
  onDeleteSelection: (ids: number[]) => void;
}

const DocsTableContainer = ({
  docs,
  loading,
  onDelete,
  onEdit,
  onDownload,
  onDownloadSelection,
  openUploadDialog,
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

  const handleDeleteSelection = () => {
    onDeleteSelection(selection);
    clearSelection();
  };

  const handleDownloadSelection = () => {
    onDownloadSelection(selection);
    clearSelection();
  };

  const tableButtons = (
    <TableButtons
      selection={selection}
      openDialog={openUploadDialog}
      onDeleteSelection={handleDeleteSelection}
      onDownloadSelection={handleDownloadSelection}
    />
  );

  return (
    <Container fluid maw={1300}>
      <Box hiddenFrom="sm" my={12}>
        {tableButtons}
      </Box>

      <Grid overflow="hidden" className={classes.docsGrid}>
        <Grid.Col
          span="auto"
          order={{ base: 2, sm: 1 }}
          className={classes.docsColumn}
        >
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
            loading={loading}
            sortedData={sortedData}
            selection={selection}
            toggleRow={toggleRow}
            toggleAll={toggleAll}
            sortBy={sortBy}
            reverseSortDirection={reverseSortDirection}
            setSorting={setSorting}
            onDownload={onDownload}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        </Grid.Col>
        <Grid.Col
          order={{ base: 1, sm: 2 }}
          visibleFrom="sm"
          className={classes.sideColumn}
        >
          {tableButtons}
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default DocsTableContainer;
