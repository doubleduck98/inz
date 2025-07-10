import { Button, Stack } from '@mantine/core';
import RoomSelect from '../components/RoomSelect';
import PatientSelect from '@/components/PatientSelect';
import { useEditFormContext } from './EditFormContext';

interface EditFormProps {
  loading: boolean;
}

const EditForm = ({ loading }: EditFormProps) => {
  const form = useEditFormContext();
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
      <Button type="submit" loading={loading} disabled={!form.isDirty()}>
        Zaktualizuj
      </Button>
    </Stack>
  );
};

export default EditForm;
