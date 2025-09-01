import { Container, Stack, Grid } from '@mantine/core';
import dayjs, { Dayjs } from 'dayjs';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import useSchedule from './useSchedule';
import { Display } from './types/Display';
import ResponsiveDialog from '@/components/ResponsiveDialog';
import { AddFormProvider, useAddForm } from './AddForm/AddFormContext';
import AddForm from './AddForm/AddForm';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/ApiError';
import { EditFormProvider, useEditForm } from './EditForm/EditFormContext';
import { Booking } from './types/Booking';
import EditForm from './EditForm/EditForm';
import Calendar from './Calendar/Calendar';
import { useState } from 'react';
import CalendarControls from './Controls/CalendarControls';
import SidebarControls from './Controls/SidebarControls';
import useNotifications from '@/hooks/useNotifications';

/**
 * Main schedule page.
 */
const Schedule = () => {
  const {
    currentDay,
    currentWeek,
    setDate,
    display,
    setDisplay,
    loading,
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
  const [addFormDialog, { open: openAddForm, close: closeAddForm }] =
    useDisclosure();
  const [editFormDialog, { open: openEditForm, close: closeEditForm }] =
    useDisclosure();
  const [formLoading, setFormLoading] = useState(false);
  const handleDateChange = (date: Dayjs) => setDate(date);
  const handleDisplayChange = (value: string) => setDisplay(value as Display);
  const { showSuccessMessage, showErrorMessage } = useNotifications();

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
      setFormLoading(true);
      await addBooking(addForm.getValues());
      showSuccessMessage('Pomyślnie zarezerwowano sale.');
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
      } else {
        showErrorMessage('Wystąpił błąd przy rezerwacji sal.');
      }
    } finally {
      setFormLoading(false);
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
      setFormLoading(true);
      await editBooking(editForm.getValues());
      showSuccessMessage('Pomyślnie zedytowano rezerwację.');
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
      } else {
        showErrorMessage('Wystapił błąd przy próbie edycji.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteBooking = async (id: number) => {
    try {
      await deleteBooking(id);
      showSuccessMessage('Pomyślnie odwołano rezerwację.');
    } catch {
      showErrorMessage('Wystąpił błąd przy odwoływaniu rezerwacji.');
    }
  };

  return (
    <Container fluid maw={1300}>
      <Grid justify="center">
        <Grid.Col span="auto">
          <Stack gap="lg" mb="lg" align={isMobile ? '' : 'center'}>
            <CalendarControls
              display={display}
              date={currentDay}
              changeDate={handleDateChange}
              changeDisplay={handleDisplayChange}
              openAddForm={openAddForm}
              prev={prev}
              next={next}
            />
            <Calendar
              display={display}
              loading={loading}
              currentDay={currentDay}
              currentWeek={currentWeek}
              daySchedule={daySchedule}
              weekSchedule={weekSchedule}
              onEdit={handleEditBooking}
              onDelete={handleDeleteBooking}
            />
          </Stack>
        </Grid.Col>
        <Grid.Col visibleFrom="sm" span="content">
          <SidebarControls
            display={display}
            changeDisplay={handleDisplayChange}
            setToday={setToday}
            prev={prev}
            next={next}
            openAddForm={openAddForm}
          />
        </Grid.Col>
      </Grid>

      <ResponsiveDialog
        title="Zarezerwuj termin"
        opened={addFormDialog}
        onClose={closeAddForm}
      >
        <AddFormProvider form={addForm}>
          <form onSubmit={addForm.onSubmit(handleSubmitAdd)}>
            <AddForm loading={formLoading} />
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
            <EditForm loading={formLoading} />
          </form>
        </EditFormProvider>
      </ResponsiveDialog>
    </Container>
  );
};

export default Schedule;
