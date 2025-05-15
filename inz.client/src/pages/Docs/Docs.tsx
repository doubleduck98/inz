import { useEffect, useState } from 'react';
import { Doc } from '../../types/Doc';
import { Button, FileInput, ScrollArea, TextInput } from '@mantine/core';
import axiosInstance from '../../Axios';
import { IconSearch } from '@tabler/icons-react';
import { sortData } from './utils/TableUtils';
import DocsTable from './components/DocsTable';

const Docs = () => {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [selection, setSelection] = useState<number[]>([]);

  const [search, setSearch] = useState('');
  const [sortedData, setSortedData] = useState(docs);
  const [sortBy, setSortBy] = useState<keyof Doc | null>(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);

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

  const [file, setFile] = useState<File | null>(null);
  const handleUpload = async () => {
    console.log('xd?');
    const formData = new FormData();
    if (!file) return;
    formData.append('file', file);
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
    } catch (e) {
      console.log(e);
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

      <FileInput label="test input" value={file} onChange={setFile} />
      <Button disabled={file ? false : true} onClick={handleUpload}>
        Upload
      </Button>
    </ScrollArea>
  );
};

export default Docs;
