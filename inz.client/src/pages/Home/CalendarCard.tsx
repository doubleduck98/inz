import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import {
  Badge,
  Box,
  Flex,
  LoadingOverlay,
  Paper,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core';
import classes from './Home.module.css';
import axiosInstance from '@/utils/Axios';
import { useMediaQuery } from '@mantine/hooks';

interface Booking {
  hour: number;
  patient: string;
  roomName: string;
}

const CalendarCard = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [date, setDate] = useState(dayjs());
  const [data, setData] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    const opts = {
      url: 'Bookings/Get',
      method: 'GET',
      withCredentials: true,
      params: { date: date.format('YYYY-MM-DD') },
    };

    try {
      setLoading(true);
      const { data } = await axiosInstance.request<Booking[]>(opts);
      let newdata = data.slice(0, 4).sort((a, b) => a.hour - b.hour);
      if (date.isSame(dayjs(), 'day')) {
        const hour = dayjs().hour();
        newdata = data.filter((b) => b.hour >= hour);
      }
      setData(newdata);
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const bookings = data.map((booking, index) => (
    <Paper
      className={classes.bookingCard}
      radius="md"
      shadow="md"
      p="xs"
      key={index}
    >
      <Flex align="center" gap="sm" miw="0">
        <Badge size="lg" color="gray" style={{ flexShrink: 0 }}>
          {booking.hour}:00
        </Badge>
        <Text size="sm" truncate>
          {booking.patient} - {booking.roomName}
        </Text>
      </Flex>
    </Paper>
  ));

  return (
    <div className={classes.calendarCard}>
      <LoadingOverlay
        visible={loading}
        overlayProps={{ radius: 'md', blur: 2 }}
        transitionProps={{ transition: 'fade', duration: 150 }}
      />
      <div className={classes.controls}>
        <UnstyledButton
          className={classes.control}
          onClick={() => setDate((current) => current.subtract(1, 'day'))}
          disabled={date.isSame(dayjs(), 'day')}
        >
          <IconChevronUp
            size={16}
            className={classes.controlIcon}
            stroke={1.5}
          />
        </UnstyledButton>

        <div className={classes.date}>
          <Text className={classes.day}>{dayjs(date).format('DD')}</Text>
          <Text className={classes.month}>
            {dayjs(date).format('DD MMMM').split(' ')[1]}
          </Text>
        </div>

        <UnstyledButton
          className={classes.control}
          onClick={() => setDate((current) => current.add(1, 'day'))}
        >
          <IconChevronDown
            size={16}
            className={classes.controlIcon}
            stroke={1.5}
          />
        </UnstyledButton>
      </div>
      <Box flex={1}>
        <Stack align={isMobile ? 'center' : undefined}>
          <Text>Nadchodzące zajęcia:</Text>
          {data.length > 0 ? (
            bookings
          ) : (
            <Text fs="italic" pl="lg">
              Brak zajęć
            </Text>
          )}
        </Stack>
      </Box>
    </div>
  );
};

export default CalendarCard;
