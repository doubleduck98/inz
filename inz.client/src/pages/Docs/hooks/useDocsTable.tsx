import { useEffect, useMemo, useState } from 'react';
import { Doc } from '@/types/Doc';
import { sortData } from '../utils/TableUtils';

interface useDocsTableProps {
  docs: Doc[];
  initSort?: keyof Doc | null;
  initSortDir?: boolean;
  initSearch?: string;
  initSelection?: number[];
}

/**
 * Hook for managing docs table state.
 */
const useDocsTable = ({
  docs,
  initSort = null,
  initSortDir = false,
  initSearch = '',
  initSelection = [],
}: useDocsTableProps) => {
  const [search, setSearch] = useState(initSearch);
  const [sortBy, setSortBy] = useState(initSort);
  const [reverseSortDirection, setReverseSortDirection] = useState(initSortDir);
  const [selection, setSelection] = useState(initSelection);

  const sortedData = useMemo(() => {
    return sortData(docs, { sortBy, reversed: reverseSortDirection, search });
  }, [docs, sortBy, reverseSortDirection, search]);

  const setSorting = (field: keyof Doc) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setSearch(value);
  };

  const handleSearchClear = () => {
    setSearch('');
  };

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

  const clearSelection = () => {
    setSelection([]);
  };

  useEffect(() => {
    setSelection([]);
  }, []);

  return {
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
  };
};

export default useDocsTable;
