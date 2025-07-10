import {
  Group,
  Button,
  Text,
  Popover,
  SegmentedControl,
  ActionIcon,
} from '@mantine/core';
import {
  IconCalendarSearch,
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react';
import { useMediaQuery, useDisclosure } from '@mantine/hooks';
import { Dayjs } from 'dayjs';
import CalendarPicker from '../Calendar/CalendarPicker';
import {
  currentWeekFmt,
  currentWeekMobileFmt,
} from '../Calendar/CalendarUtils';
import { Display } from '../types/Display';

type CalendarControlsProps = {
  display: Display;
  date: Dayjs;
  changeDate: (date: Dayjs) => void;
  changeDisplay: (value: string) => void;
  openAddForm: () => void;
  prev: () => void;
  next: () => void;
};

const CalendarControls = ({
  display,
  date: currentDay,
  changeDate,
  changeDisplay,
  openAddForm,
  prev,
  next,
}: CalendarControlsProps) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [pop, { open: openPopover, close: closePopover }] = useDisclosure();

  const mobileDispControls = [
    { label: 'Dzień', value: 'day' },
    { label: 'Tydzień', value: 'list' },
  ];

  return (
    <>
      <Group
        justify="center"
        pt="sm"
        hiddenFrom="sm"
        grow
        preventGrowOverflow={false}
      >
        <SegmentedControl
          size="md"
          maw={'60%'}
          value={display}
          onChange={changeDisplay}
          withItemsBorders={false}
          data={mobileDispControls}
        />
        <Button variant="gradient" onClick={openAddForm}>
          Dodaj
        </Button>
      </Group>
      <Group gap={0} justify="space-between">
        <ActionIcon
          size="compact-md"
          variant="subtle"
          color="gray"
          px={0}
          onClick={prev}
          hiddenFrom="sm"
        >
          <IconChevronLeft />
        </ActionIcon>
        <Popover withOverlay opened={pop} onDismiss={closePopover}>
          <Popover.Target>
            <Button
              variant="transparent"
              color="gray"
              h={60}
              onClick={openPopover}
              leftSection={
                <IconCalendarSearch
                  style={{ padding: 2 }}
                  size={isMobile ? 24 : 40}
                />
              }
            >
              <Text fw={500} fz={{ base: 21, sm: 40 }} pt="3">
                {display === 'day'
                  ? currentDay.format('DD MMMM YYYY')
                  : isMobile
                    ? currentWeekMobileFmt(currentDay)
                    : currentWeekFmt(currentDay)}
              </Text>
            </Button>
          </Popover.Target>
          <Popover.Dropdown>
            <CalendarPicker
              date={currentDay.format()}
              setDate={(date) => {
                changeDate(date);
                closePopover();
              }}
              display={display}
            />
          </Popover.Dropdown>
        </Popover>
        <ActionIcon
          size="compact-md"
          variant="subtle"
          color="gray"
          px={0}
          onClick={next}
          hiddenFrom="sm"
        >
          <IconChevronRight />
        </ActionIcon>
      </Group>
    </>
  );
};

export default CalendarControls;
