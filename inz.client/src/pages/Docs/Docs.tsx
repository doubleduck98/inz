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
import { sortData } from './utils/TableUtils';
import DocsTable from './DocsTable/DocsTable';
import { useDisclosure } from '@mantine/hooks';
import UploadModal from './UploadModal/UploadModal';
import { useForm } from '@mantine/form';
import TableButtons from './DocsTable/TableButtons';
import { AxiosResponse } from 'axios';

interface FormValues {
  file: File | null;
  fileName: string;
}

const Docs = () => {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [selection, setSelection] = useState<number[]>([]);

  const [search, setSearch] = useState('');
  const [sortedData, setSortedData] = useState(docs);
  const [sortBy, setSortBy] = useState<keyof Doc | null>(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);

  const [collapsed, { toggle: toggleCollapse }] = useDisclosure(false);
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);

  const toggleRow = (id: number) =>
    setSelection((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );

  const toggleAll = () =>
    setSelection((current) =>
      // sorted.length === docs.length przy unclicku
      current.length === docs.length ? [] : sortedData.map((d) => d.id)
    );

  const setSorting = (field: keyof Doc) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(sortData(docs, { sortBy: field, reversed, search }));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setSearch(value);
    setSortedData(
      sortData(docs, { sortBy, reversed: reverseSortDirection, search: value })
    );
  };

  const handleSearchClear = () => {
    setSearch('');
    setSortedData(
      sortData(docs, { sortBy, reversed: reverseSortDirection, search: '' })
    );
  };

  const getDocuments = async () => {
    const opts = {
      url: 'Resources/Get',
      method: 'GET',
      headers: { 'content-type': 'application/json' },
      withCredentials: true,
    };

    try {
      const { data }: AxiosResponse<Doc[]> = await axiosInstance.request(opts);
      setDocs(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getDocuments();
  }, []);

  useEffect(() => {
    setSortedData(docs);
  }, [docs]);

  const form = useForm<FormValues>({
    initialValues: {
      file: null,
      fileName: '',
    },

    validate: {
      file: (val) => (val ? null : 'Proszę wybrać plik'),
      fileName: (val) => (val.length > 200 ? 'Nazwa jest za długa' : null),
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
      form.setErrors({ file: 'Taki plik juz istnieje' });
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
      setSelection([]);
    } catch (e) {
      console.log(e);
    }
  };

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
            <Box pt={12}>
              <TableButtons
                selection={selection}
                openModal={openModal}
                onDeleteSelection={handleDeleteSelection}
              />
            </Box>
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
            <TableButtons
              openModal={openModal}
              selection={selection}
              onDeleteSelection={handleDeleteSelection}
            />
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
