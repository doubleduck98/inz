import { useState } from 'react';
import {
  Stack,
  PillsInput,
  Pill,
  Popover,
  PillGroup,
  Button,
  Group,
  Text,
} from '@mantine/core';
import { Calendar } from '@mantine/dates';
import { useAddFormContext } from './AddFormContext';
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconCalendar,
} from '@tabler/icons-react';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Available } from '../types/Available';
import TimePicker from './TimePicker';
import axiosInstance from '../../../Axios';
import PatientSelect from '../components/PatientSelect';
import RoomSelect from '../components/RoomSelect';

const IDX_FORMAT = 'YYYY-MM-DD';

const AddForm = () => {
  dayjs.extend(utc);
  const form = useAddFormContext();
  const dates = form.getValues().dates;
  const [view, setView] = useState<'dates' | 'hours'>('dates');
  const [availableHours, setAvailable] = useState<Available>({});
  const [loading, setLoading] = useState(false);

  const handlePillRemove = (date: Dayjs) => {
    form.setFieldValue(
      'dates',
      dates.filter((d) => !d.isSame(dayjs(date)))
    );
  };

  const handleDateSelet = (date: string) => {
    let newdates = [...dates];
    if (!dates.some((b) => dayjs.utc(date).isSame(b, 'day')))
      newdates = [...newdates, dayjs.utc(date)];
    else newdates = newdates.filter((d) => !d.isSame(dayjs.utc(date)));
    form.setFieldValue(
      'dates',
      newdates.sort((a, b) => a.valueOf() - b.valueOf())
    );
  };

  const handleDateSubmit = () => {
    if (form.validate().hasErrors) return;
    form.setFieldValue(
      'bookings',
      Object.fromEntries(dates.map((k) => [k.format(IDX_FORMAT), null]))
    );
    fetchAvailable();
  };

  const fetchAvailable = async () => {
    setLoading(true);
    setView('hours');
    const opts = {
      url: `Bookings/GetFree`,
      method: 'Get',
      withCredentials: true,
      params: {
        roomId: form.getValues().roomId,
        dates: dates.map((b) => b.format(IDX_FORMAT)),
      },
      paramsSerializer: { indexes: null },
    };
    try {
      const { data } = await axiosInstance.request(opts);
      setAvailable(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSelect = (date: Dayjs, hour: string) => {
    form.setFieldValue(
      `bookings.${date.format(IDX_FORMAT)}`,
      parseInt(hour.slice(0, 2))
    );
    console.log(form.getValues().bookings);
  };

  if (view === 'hours') {
    const errorMessage = form.errors['hours'];
    return (
      <Stack>
        {dates.map((date) => (
          <TimePicker
            key={date.valueOf()}
            loading={loading}
            date={date}
            onTimeSelect={handleTimeSelect}
            availableHours={availableHours[date.format(IDX_FORMAT)] || []}
            errorMessage={form.errors[
              `bookings.${date.format(IDX_FORMAT)}`
            ]?.toString()}
          />
        ))}
        {errorMessage && (
          <Group
            justify="center"
            pt="xs"
            style={{ color: 'var(--mantine-color-red-8)' }}
          >
            <IconAlertTriangle size={18} />
            <Text>{errorMessage}</Text>
          </Group>
        )}
        <Group justify="center" mt="md" grow preventGrowOverflow={false}>
          <Button
            variant="default"
            maw="15%"
            p={2}
            onClick={() => setView('dates')}
          >
            <IconArrowLeft></IconArrowLeft>
          </Button>
          <Button type="submit">Wyślij</Button>
        </Group>
      </Stack>
    );
  }

  const pills = dates.map((date) => (
    <Pill
      key={date.valueOf()}
      withRemoveButton
      onRemove={() => handlePillRemove(date)}
    >
      {date.format('DD-MM-YYYY')}
    </Pill>
  ));

  return (
    <Stack>
      <PatientSelect
        defaultValue={form.getValues().patient}
        errorProps={form.getInputProps('patientId').error}
        setPatientValue={(value) => form.setFieldValue('patient', value)}
        setPatientIdValue={(value) => form.setFieldValue('patientId', value)}
      />
      <RoomSelect
        defaultValue={form.getValues().room}
        errorProps={form.getInputProps('roomId').error}
        setRoomValue={(value) => form.setFieldValue('room', value)}
        setRoomIdValue={(value) => form.setFieldValue('roomId', value)}
      />

      <Popover position="bottom-start" withArrow shadow="md">
        <Popover.Target>
          <PillsInput
            label="Terminy"
            pointer
            rightSection={<IconCalendar stroke={1.5} />}
            rightSectionPointerEvents="none"
            {...form.getInputProps('dates')}
          >
            <PillGroup>
              {pills.length > 0 ? (
                pills
              ) : (
                <PillsInput.Field placeholder="Wybierz daty zajęć" />
              )}
            </PillGroup>
          </PillsInput>
        </Popover.Target>

        <Popover.Dropdown>
          <Calendar
            getDayProps={(date) => ({
              selected: dates.some((s) => dayjs(date).isSame(s, 'date')),
              onClick: () => handleDateSelet(date),
            })}
            excludeDate={(date) => {
              const day = dayjs(date).day();
              return day === 6 || day === 0;
            }}
          />
        </Popover.Dropdown>
      </Popover>

      <Button mt="sm" onClick={handleDateSubmit}>
        Dalej
      </Button>
    </Stack>
  );
};

export default AddForm;
