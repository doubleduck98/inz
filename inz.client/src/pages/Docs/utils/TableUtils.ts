import { Doc } from '../../../types/Doc';

export const sortData = (
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

export const filterData = (data: Doc[], search: string) => {
  const q = search.toLowerCase().trim();
  return data.filter((d) =>
    Object.values(d).some((val) => {
      return typeof val === 'string' ? val.toLowerCase().includes(q) : false;
    })
  );
};
