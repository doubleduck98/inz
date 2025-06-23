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
import { Dayjs } from 'dayjs';
import CalendarPicker from './Calendar/CalendarPicker';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { currentWeekFmt, currentWeekMobileFmt } from './Calendar/CalendarUtils';
import CalendarDay from './Calendar/CalendarDay';
import CalendarWeek from './Calendar/CalendarWeek';
import CalendarList from './Calendar/CalendarList';
import useCalendar from './useCalendar';
import { Display } from './types/Display';

const Schedule = () => {
  const {
    currentDay,
    currentWeek,
    setDate,
    display,
    setDisplay,
    // loading,
    daySchedule,
    weekSchedule,
    prev,
    next,
    setToday,
  } = useCalendar();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [pop, { open: openPopover, close: closePopover }] = useDisclosure();
  const handleDateChange = (date: Dayjs) => {
    setDate(date);
    closePopover();
  };
  const handleDisplayChange = (value: string) => setDisplay(value as Display);
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
            <CalendarDay date={currentDay} schedule={daySchedule} />
          )}

          {display === 'week' && (
            <CalendarWeek
              currentDate={currentWeek}
              weekSchedule={weekSchedule}
            />
          )}

          {display === 'list' && (
            <CalendarList
              currentDate={currentWeek}
              weekSchedule={weekSchedule}
            />
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
