import { Menu, ActionIcon, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconCalendarOff, IconDots, IconEdit } from '@tabler/icons-react';
import { Booking } from '../types/Booking';
import { modals } from '@mantine/modals';
import dayjs from 'dayjs';

interface BookingActionsProps {
  className?: string;
  booking: Booking;
  onEdit: (booking: Booking) => void;
  onDelete: (id: number) => void;
}

const BookingActions = ({
  className,
  booking,
  onEdit,
  onDelete,
}: BookingActionsProps) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const handleDelete = (id: number) => {
    modals.openConfirmModal({
      title: 'Odwołaj',
      children: (
        <Text size="sm" lineClamp={3}>
          Czy chcesz odwołać rezerwację dla {booking.patient} o {booking.hour}
          :00, {dayjs(booking.date).format('DD MMMM YYYY')} w {booking.roomName}
          ?
        </Text>
      ),
      labels: { confirm: 'Usuń', cancel: 'Anuluj' },
      confirmProps: { color: 'red' },
      onConfirm: () => onDelete(id),
    });
  };

  return (
    <Menu shadow="md" position={isMobile ? 'bottom-end' : 'bottom'} withArrow>
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray" className={className}>
          <IconDots size={16} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          onClick={() => onEdit(booking)}
          leftSection={<IconEdit size={16} />}
        >
          Edytuj
        </Menu.Item>
        <Menu.Item
          color="red"
          onClick={() => handleDelete(booking.id)}
          leftSection={<IconCalendarOff size={16} />}
        >
          Odwołaj
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default BookingActions;
