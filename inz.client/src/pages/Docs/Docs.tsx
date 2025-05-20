import { useEffect, useState } from 'react';
import { Doc } from '../../types/Doc';
import {
  Box,
  Button,
  CloseButton,
  Collapse,
  Container,
  Grid,
  TextInput,
} from '@mantine/core';
import axiosInstance from '../../Axios';
import {
  IconChevronDown,
  IconChevronUp,
  IconSearch,
} from '@tabler/icons-react';
import DocsTable from './DocsTable/DocsTable';
import { useDisclosure } from '@mantine/hooks';
import UploadModal from './UploadModal/UploadModal';
import { useForm } from '@mantine/form';
import TableButtons from './DocsTable/TableButtons';
import useDocsTable from './DocsTable/useDocsTable';

interface FormValues {
  file: File | null;
  fileName: string;
}

const Docs = () => {
  const [docs, setDocs] = useState<Doc[]>([]);
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
  } = useDocsTable({ docs: docs });

  const [collapsed, { toggle: toggleCollapse }] = useDisclosure(false);
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);

  const getDocuments = async () => {
    const opts = {
      url: 'Resources/Get',
      method: 'GET',
      headers: { 'content-type': 'application/json' },
      withCredentials: true,
    };

    try {
      const { data } = await axiosInstance.request(opts);
      setDocs(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getDocuments();
  }, []);

  const form = useForm<FormValues>({
    initialValues: {
      file: null,
      fileName: '',
    },

    validate: {
      file: (val) => (val ? null : 'Proszę wybrać plik'),
      fileName: (val) => {
        if (!val.length) return 'Proszę podać nazwę';
        if (val.length > 200) return 'Nazwa jest za długa (maks. 200 znaków)';
        return null;
      },
    },
  });

  const onFileChange = (file: File | null) => {
    if (file) form.setValues({ fileName: file.name, file: file });
    else form.setValues({ file: file });
  };

  const handleUpload = async () => {
    const formData = new FormData();
    const file: unknown = form.values.file;
    formData.append('file', file as File);
    formData.append('fileName', form.values.fileName);
    const opts = {
      url: 'Resources/Create',
      method: 'POST',
      headers: { 'content-type': 'multipart/form-data' },
      data: formData,
      withCredentials: true,
    };

    try {
      const { data } = await axiosInstance.request(opts);
      console.log(data);
      setDocs([data, ...docs]);
      form.reset();
      closeModal();
    } catch (e) {
      console.log(e);
      form.setErrors({
        file: ' ',
        fileName: 'Plik o takiej nazwie już istnieje',
      });
    }
  };

  const handleDownloadSelection = async () => {
    console.log(selection);
    const opts = {
      url: 'Resources/Download',
      method: 'GET',
      headers: { 'content-type': 'application/json' },
      params: { ids: selection },
      paramsSerializer: { indexes: null },
    };

    try {
      const { data, headers } = await axiosInstance.request<Blob>({
        ...opts,
        responseType: 'blob',
      });

      const href = URL.createObjectURL(data);
      const link = document.createElement('a');
      const content = headers['content-disposition'];

      link.href = href;
      link.download = content.match(/filename="(.+)"/)[1];
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(href);
    } catch (e) {
      console.log(e);
    }
  };

  const handleDelete = async (id: number) => {
    const opts = {
      url: `Resources/Delete/${id}`,
      method: 'DELETE',
      withCredentials: true,
    };

    try {
      await axiosInstance.request(opts);
      setDocs(docs.filter((d) => d.id !== id));
    } catch (e) {
      console.log(e);
    }
  };

  const handleDeleteSelection = async () => {
    const opts = {
      url: `Resources/Delete/`,
      method: 'DELETE',
      withCredentials: true,
      data: {
        ids: selection,
      },
    };

    try {
      await axiosInstance.request(opts);
      setDocs(docs.filter((d) => !selection.includes(d.id)));
    } catch (e) {
      console.log(e);
    }
  };

  const tableButtons = (
    <TableButtons
      selection={selection}
      openModal={openModal}
      onDownloadSelection={handleDownloadSelection}
      onDeleteSelection={handleDeleteSelection}
    />
  );

  return (
    <>
      <Container fluid>
        <Box hiddenFrom="sm" my={12}>
          <Button
            variant="default"
            onClick={toggleCollapse}
            fullWidth
            rightSection={
              collapsed ? (
                <IconChevronUp size={18} />
              ) : (
                <IconChevronDown size={18} />
              )
            }
          />
          <Collapse in={collapsed}>
            <Box pt={12}>{tableButtons}</Box>
          </Collapse>
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
              onDelete={handleDelete}
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

      <UploadModal
        opened={modalOpened}
        onClose={closeModal}
        onSubmit={form.onSubmit(handleUpload)}
        inputProps={form.getInputProps}
        fileChosen={!form.values.file}
        onFileChange={onFileChange}
      />
    </>
  );
};

export default Docs;
