import { useEffect, useState } from 'react';
import { Doc } from '../../types/Doc';
import { Button, ScrollArea, TextInput } from '@mantine/core';
import axiosInstance from '../../Axios';
import { IconSearch } from '@tabler/icons-react';
import { sortData } from './utils/TableUtils';
import DocsTable from './DocsTable/DocsTable';
import { useDisclosure } from '@mantine/hooks';
import UploadModal from './UploadModal/UploadModal';
import { useForm } from '@mantine/form';

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

  const getDocuments = async () => {
    const opts = {
      url: 'Resources/GetAll',
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

  return (
    <ScrollArea>
      <TextInput
        placeholder="Search by any field"
        mb="md"
        leftSection={<IconSearch size={16} stroke={1.5} />}
        value={search}
        onChange={handleSearchChange}
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
        onDownload={() => {}}
        onDelete={() => {}}
      />

      <UploadModal
        opened={modalOpened}
        onClose={closeModal}
        onSubmit={form.onSubmit(handleUpload)}
        inputProps={form.getInputProps}
        submitDisabled={!form.values.file}
        onFileChange={onFileChange}
      />
      <Button variant="default" onClick={openModal}>
        Wyslij plik
      </Button>
    </ScrollArea>
  );
};

export default Docs;
