import dayjs, { Dayjs } from 'dayjs';

function getDay(date: string) {
  const day = dayjs(date).day();
  return day === 0 ? 6 : day - 1;
}

function startOfWeek(date: string) {
  return dayjs(date)
    .subtract(getDay(date) + 1, 'day')
    .toDate();
}

export const startOfWeekDate = (date: Dayjs) => date.startOf('week');

const endOfWeek = (date: string) => dayjs(date).endOf('week');

export function isInWeekRange(date: string, value: string | null) {
  return value
    ? dayjs(date).isBefore(endOfWeek(value)) &&
        dayjs(date).isAfter(startOfWeek(value))
    : false;
}

export const beginningOfWeek = (date: string) => dayjs(date).startOf('week');

export const getCurrentWeek = () => dayjs().startOf('week');

export const currentWeekFmt = (date: Dayjs) => {
  const start = date.startOf('week');
  const end = date.endOf('week');
  if (start.month() === end.month())
    return `${start.format('DD')} - ${end.format('DD MMMM YYYY')}`;
  return `${start.format('DD MMMM')} - ${end.format('DD MMMM YYYY')}`;
};

export const currentWeekMobileFmt = (date: Dayjs) => {
  const start = date.startOf('week');
  const end = date.endOf('week');
  return `${start.format('DD.MM')} - ${end.format('DD.MM.YYYY')}`;
};
