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
import CalendarPicker from './Calendar/CalendarPicker';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { currentWeekFmt, currentWeekMobileFmt } from './Calendar/CalendarUtils';
import CalendarDay from './Calendar/CalendarDay';
import CalendarWeek from './Calendar/CalendarWeek';
import CalendarList from './Calendar/CalendarList';
import useSchedule from './useSchedule';
import { Display } from './types/Display';
import ResponsiveDialog from '../../ResponsiveDialog';
import { AddFormProvider, useAddForm } from './AddForm/AddFormContext';
import AddForm from './AddForm/AddForm';
import { AxiosError } from 'axios';
import { ApiError } from '../../types/ApiError';
import { EditFormProvider, useEditForm } from './EditForm/EditFormContext';
import { Booking } from './types/Booking';
import EditForm from './EditForm/EditForm';

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
    addBooking,
    editBooking,
    deleteBooking,
    prev,
    next,
    setToday,
  } = useSchedule();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [pop, { open: openPopover, close: closePopover }] = useDisclosure();
  const [addFormDialog, { open: openAddForm, close: closeAddForm }] =
    useDisclosure();
  const [editFormDialog, { open: openEditForm, close: closeEditForm }] =
    useDisclosure();
  const handleDateChange = (date: Dayjs) => {
    setDate(date);
    closePopover();
  };
  const handleDisplayChange = (value: string) => setDisplay(value as Display);

  const addForm = useAddForm({
    mode: 'uncontrolled',
    initialValues: {
      dates: [],
      bookings: {},
      patientId: null,
      roomId: null,
      patient: '',
      room: '',
    },
    validate: {
      patientId: (value) => (value ? null : 'Proszę wybrać pacjenta'),
      roomId: (value) => (value ? null : 'Proszę wybrać salę'),
      dates: (value) =>
        value.length === 0 ? 'Proszę wybrać conajmniej jedną datę' : null,
    },
  });

  const handleSubmitAdd = async () => {
    const bookings = addForm.getValues().bookings;
    if (Object.values(bookings).some((val) => val === null)) {
      addForm.setFieldError('hours', 'Proszę wybrać godzinę dla każdej daty');
      return;
    }
    try {
      await addBooking(addForm.getValues());
      addForm.reset();
      closeAddForm();
    } catch (e) {
      if (e instanceof AxiosError && e.response?.data) {
        const error = e.response.data as ApiError;
        if (error.status === 409 && error.detail) {
          const conflicts = error.detail.split(', ');
          const errors: Record<string, string> = {};
          conflicts.forEach((c) => {
            const datehour = c.split(' ');
            const hour = datehour.pop();
            const date = dayjs(datehour.pop());
            errors[`bookings.${date.format('YYYY-MM-DD')}`] =
              `Termin o godzinie ${hour}:00 jest zajęty`;
          });
          addForm.setErrors(errors);
        }
      }
    }
  };

  const editForm = useEditForm({
    mode: 'uncontrolled',
    initialValues: {
      id: 0,
      patientId: null,
      roomId: null,
      patient: '',
      room: '',
    },
    validate: {
      patientId: (value) => (value ? null : 'Proszę wybrać pacjenta'),
      roomId: (value) => (value ? null : 'Proszę wybrać salę'),
    },
  });

  const handleEditBooking = (booking: Booking) => {
    const vals = {
      id: booking.id,
      patient: booking.patient,
      room: booking.roomName,
      patientId: booking.patientId,
      roomId: booking.roomId,
    };
    editForm.setInitialValues(vals);
    editForm.setValues(vals);
    editForm.resetDirty();
    openEditForm();
  };

  const handleSubmitEdit = async () => {
    try {
      await editBooking(editForm.getValues());
      editForm.reset();
      closeEditForm();
    } catch (e) {
      if (e instanceof AxiosError && e.response?.data) {
        const error = e.response.data as ApiError;
        if (error.status === 409) {
          editForm.setFieldError(
            'roomId',
            'W tym terminie ten pokój jest już zarezerwowany'
          );
        }
      }
    }
  };

  const handleDeleteBooking = async (id: number) => {
    try {
      await deleteBooking(id);
    } catch (e) {
      console.error(e);
    }
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
              <Group
                justify="center"
                hiddenFrom="sm"
                grow
                preventGrowOverflow={false}
              >
                <SegmentedControl
                  size="md"
                  maw={'60%'}
                  value={display}
                  onChange={handleDisplayChange}
                  withItemsBorders={false}
                  data={mobileDispControls}
                />
                <Button variant="gradient" onClick={openAddForm}>
                  Dodaj
                </Button>
              </Group>
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
            <CalendarDay
              date={currentDay}
              schedule={daySchedule}
              onEdit={handleEditBooking}
              onDelete={handleDeleteBooking}
            />
          )}

          {display === 'week' && (
            <CalendarWeek
              currentDate={currentWeek}
              weekSchedule={weekSchedule}
              onEdit={handleEditBooking}
              onDelete={handleDeleteBooking}
            />
          )}

          {display === 'list' && (
            <CalendarList
              currentDate={currentWeek}
              weekSchedule={weekSchedule}
              onEdit={handleEditBooking}
              onDelete={handleDeleteBooking}
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
            <Button variant="gradient" onClick={openAddForm}>
              Dodaj
            </Button>
          </Stack>
        </Grid.Col>
      </Grid>

      <ResponsiveDialog
        title="Zarezerwuj termin"
        opened={addFormDialog}
        onClose={closeAddForm}
      >
        <AddFormProvider form={addForm}>
          <form onSubmit={addForm.onSubmit(handleSubmitAdd)}>
            <AddForm />
          </form>
        </AddFormProvider>
      </ResponsiveDialog>

      <ResponsiveDialog
        title="Edytuj rezerwację"
        opened={editFormDialog}
        onClose={closeEditForm}
      >
        <EditFormProvider form={editForm}>
          <form onSubmit={editForm.onSubmit(handleSubmitEdit)}>
            <EditForm />
          </form>
        </EditFormProvider>
      </ResponsiveDialog>
    </Container>
  );
};

export default Schedule;
