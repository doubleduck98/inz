import dayjs from 'dayjs';

export const stripExtension = (filename: string | undefined) => {
  if (!filename) return filename;
  const dot = filename.lastIndexOf('.');
  if (dot < 0) return filename;
  return filename.slice(0, dot);
};

export const expBadgeFormat = (date: string) => {
  const deletedOn = dayjs(date).add(30, 'days');
  const delta = deletedOn.diff(dayjs(), 'days');
  if (delta < 1) return '<1 DZIEŃ';
  if (delta === 1) return `1 DZIEŃ`;
  return `${deletedOn.diff(dayjs(), 'days')} DNI`;
};
