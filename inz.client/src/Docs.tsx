import classes from './Docs.module.css';
import { useEffect, useState } from 'react';
import { Doc } from './types/Doc';
import {
  Button,
  Center,
  Checkbox,
  FileInput,
  Group,
  ScrollArea,
  Table,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core';
import axiosInstance from './Axios';
import {
  IconChevronDown,
  IconChevronUp,
  IconDownload,
  IconFileTypePdf,
  IconSearch,
  IconSelector,
  IconTrash,
} from '@tabler/icons-react';
import { useForm } from '@mantine/form';

interface ThProps {
  children: React.ReactNode;
  reversed: boolean;
  sorted: boolean;
  onSort: () => void;
}

const Th = ({ children, reversed, sorted, onSort }: ThProps) => {
  const Icon = sorted
    ? reversed
      ? IconChevronUp
      : IconChevronDown
    : IconSelector;
  return (
    <Table.Th className={classes.th}>
      <UnstyledButton onClick={onSort} className={classes.control}>
        <Group justify="space-between">
          <Text fw={500} fz="sm">
            {children}
          </Text>
          <Center className={classes.icon}>
            <Icon size={16} stroke={1.5} />
          </Center>
        </Group>
      </UnstyledButton>
    </Table.Th>
  );
};

const filterData = (data: Doc[], search: string) => {
  const q = search.toLowerCase().trim();
  return data.filter((d) =>
    Object.values(d).some((val) => {
      return typeof val === 'string' ? val.toLowerCase().includes(q) : false;
    })
  );
};

const sortData = (
  data: Doc[],
  payload: { sortBy: keyof Doc | null; reversed: boolean; search: string }
) => {
  const { sortBy } = payload;

  if (!sortBy) {
    return filterData(data, payload.search);
  }

  return filterData(
    data.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return payload.reversed
          ? bValue.localeCompare(aValue)
          : aValue.localeCompare(bValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return payload.reversed ? bValue - aValue : aValue - bValue;
      }

      return 0;
    }),
    payload.search
  );
};

const Docs = () => {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [selection, setSelection] = useState<number[]>([]);
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

  const [search, setSearch] = useState('');
  const [sortedData, setSortedData] = useState(docs);
  const [sortBy, setSortBy] = useState<keyof Doc | null>(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);

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

  const docList = sortedData.map((d) => {
    // const selected = selection.includes(d.id);
    return (
      <Table.Tr key={d.id}>
        <Table.Td>
          <Checkbox
            checked={selection.includes(d.id)}
            onChange={() => toggleRow(d.id)}
          />
        </Table.Td>
        <Table.Td>
          <Group gap="sm">
            <IconFileTypePdf size={26} radius={26} />
            {d.fileName}
          </Group>
        </Table.Td>
        <Table.Td>{d.fileType}</Table.Td>
        <Table.Td>
          <Group>
            <IconDownload />
            <IconTrash />
          </Group>
        </Table.Td>
      </Table.Tr>
    );
  });

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
      <Table maw={400} verticalSpacing="sm">
        {/* <Table.Thead>
          <Table.Tr>
            
            <Table.Th>Nazwa</Table.Th>
            <Table.Th>Typ</Table.Th>
          </Table.Tr>
        </Table.Thead> */}
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
            <Th
              sorted={sortBy === 'fileName'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('fileName')}
            >
              Nazwa
            </Th>
            <Th
              sorted={sortBy === 'fileType'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('fileType')}
            >
              Typ
            </Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{docList}</Table.Tbody>
      </Table>

      <FileInput label="test input" value={file} onChange={setFile} />
      <Button disabled={file ? false : true} onClick={handleUpload}>
        Upload
      </Button>
    </ScrollArea>
  );
};

export default Docs;
