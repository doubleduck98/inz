import {
  Container,
  Group,
  Button,
  Text,
  Stack,
  Popover,
  SegmentedControl,
  Grid,
} from '@mantine/core';
import {
  IconCalendarSearch,
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import CalendarPicker from './Calendar/CalendarPicker';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import {
  currentWeekFmt,
  currentWeekMobileFmt,
  startOfWeekDate,
} from './Calendar/CalendarUtils';
import CalendarDay from './Calendar/CalendarDay';
import CalendarWeek from './Calendar/CalendarWeek';
import { WeekSchedule } from './types/Schedule';
import CalendarList from './Calendar/CalendarList';

const mockWeek: WeekSchedule = {
  days: [
    {
      bookings: [
        {
          time: 9,
          patient: 'Szymon Zienkiewicz',
          room: 'Bardzo długa nazwa sali xd',
        },
        { time: 15, patient: 'Bartosz Błaszczyk', room: 'Sala 1' },
      ],
    },
    {
      bookings: [{ time: 11, patient: 'Szymon Zienkiewicz', room: 'Sala 2' }],
    },
    {
      bookings: [],
    },
    {
      bookings: [
        { time: 14, patient: 'Marcin Krasucki', room: 'Sala 1' },
        { time: 15, patient: 'Daniel Zwierzyński', room: 'Sala 2' },
        { time: 16, patient: 'Szymon Zienkiewicz', room: 'Sala 3' },
      ],
    },
    {
      bookings: [{ time: 9, patient: 'Marcin Krasucki', room: 'Sala 2' }],
    },
  ],
};

const Schedule = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const date = dayjs();
  const [currentDay, setDate] = useState(date);
  const currentWeek = startOfWeekDate(currentDay);
  const [display, setDisplay] = useState<'day' | 'week' | 'list'>('week');

  useEffect(() => {
    if (isMobile) setDisplay('list');
    else setDisplay('week');
  }, [isMobile]);

  const prev = () => {
    const shift = display === 'day' ? 'day' : 'week';
    let newDate = currentDay.subtract(1, shift);
    if (display !== 'day') newDate = startOfWeekDate(newDate);
    setDate(newDate);
  };
  const next = () => {
    const shift = display === 'day' ? 'day' : 'week';
    let newDate = currentDay.add(1, shift);
    if (display !== 'day') newDate = startOfWeekDate(newDate);
    setDate(newDate);
  };
  const setToday = () => setDate(dayjs());

  const [pop, { open: openPopover, close: closePopover }] = useDisclosure();
  const handleDateChange = (date: Dayjs) => {
    setDate(date);
    closePopover();
  };
  const handleDisplayChange = (value: string) => {
    if (value === 'day' || value === 'week' || value === 'list')
      setDisplay(value);
  };
  const displayControls = [
    { label: 'Dzień', value: 'day' },
    { label: 'Tydzień', value: 'week' },
    { label: 'Lista', value: 'list' },
  ];
  const mobileDispControls = [
    { label: 'Dzień', value: 'day' },
    { label: 'Tydzień', value: 'list' },
  ];

  return (
    <Container fluid>
      <Grid>
        <Grid.Col span="auto">
          <Stack gap="lg" mb="lg">
            <Group justify="space-between" visibleFrom="sm"></Group>
            <Stack mt={{ base: 'md', sm: 0 }} gap="xs">
              <SegmentedControl
                hiddenFrom="sm"
                size="md"
                value={display}
                onChange={handleDisplayChange}
                withItemsBorders={false}
                data={mobileDispControls}
              />
              <Popover withOverlay opened={pop} onDismiss={closePopover}>
                <Popover.Target>
                  <Button
                    variant="transparent"
                    color="gray"
                    onClick={openPopover}
                    leftSection={
                      <IconCalendarSearch
                        style={{ padding: 2 }}
                        size={isMobile ? 24 : 40}
                      />
                    }
                  >
                    <Text fw={500} fz={{ base: 24, sm: 40 }}>
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
                    setDate={handleDateChange}
                    display={display}
                  />
                </Popover.Dropdown>
              </Popover>
            </Stack>
          </Stack>

          {display === 'day' && (
            <CalendarDay date={currentDay} schedule={mockWeek.days[0]} />
          )}

          {display === 'week' && (
            <CalendarWeek currentDate={currentWeek} weekSchedule={mockWeek} />
          )}

          {display === 'list' && (
            <CalendarList currentDate={currentWeek} weekSchedule={mockWeek} />
          )}
        </Grid.Col>
        <Grid.Col visibleFrom="sm" span="content">
          <Stack>
            <SegmentedControl
              size="md"
              value={display}
              onChange={handleDisplayChange}
              withItemsBorders={false}
              data={displayControls}
            />
            <Group>
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
          </Stack>
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default Schedule;
