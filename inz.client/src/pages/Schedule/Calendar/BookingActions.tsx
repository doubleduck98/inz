import { Menu, ActionIcon } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconCalendarOff, IconDots, IconEdit } from '@tabler/icons-react';

interface BookingActionsProps {
  className?: string;
}

const BookingActions = ({ className }: BookingActionsProps) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return (
    <Menu shadow="md" position={isMobile ? 'bottom-end' : 'bottom'} withArrow>
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray" className={className}>
          <IconDots size={16} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item leftSection={<IconEdit size={16} />}>Edytuj</Menu.Item>
        <Menu.Item color="red" leftSection={<IconCalendarOff size={16} />}>
          Odwołaj
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default BookingActions;
