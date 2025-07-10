import { SegmentedControl, Group, Button, Stack } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { Display } from '../types/Display';

type SidebarControlsProps = {
  display: Display;
  changeDisplay: (value: string) => void;
  setToday: () => void;
  prev: () => void;
  next: () => void;
  openAddForm: () => void;
};

const SidebarControls = ({
  display,
  changeDisplay,
  setToday,
  prev,
  next,
  openAddForm,
}: SidebarControlsProps) => {
  const displayControls = [
    { label: 'Dzień', value: 'day' },
    { label: 'Tydzień', value: 'week' },
    { label: 'Lista', value: 'list' },
  ];

  return (
    <Stack>
      <SegmentedControl
        size="md"
        value={display}
        onChange={changeDisplay}
        withItemsBorders={false}
        data={displayControls}
      />
      <Group justify="space-between">
        <Button variant="default" onClick={setToday}>
          Teraz
        </Button>
        <Button.Group>
          <Button variant="default" onClick={prev}>
            <IconChevronLeft />
          </Button>
          <Button variant="default" onClick={next}>
            <IconChevronRight />
          </Button>
        </Button.Group>
      </Group>
      <Button variant="gradient" onClick={openAddForm}>
        Dodaj
      </Button>
    </Stack>
  );
};

export default SidebarControls;
