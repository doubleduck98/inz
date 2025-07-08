import { Button, Stack, Textarea } from '@mantine/core';
import PatientSelect from '@/components/PatientSelect';
import { useEditFormContext } from './EditFormContext';

const EditForm = () => {
  const form = useEditFormContext();
  return (
    <Stack>
      <PatientSelect
        defaultValue={form.getValues().patientName || ''}
        errorProps={form.getInputProps('patientId').error}
        setPatientValue={(value) => form.setFieldValue('patient', value)}
        setPatientIdValue={(value) => form.setFieldValue('patientId', value)}
      />
      <Textarea
        label="Nazwa dokumentu:"
        autosize
        maxRows={4}
        {...form.getInputProps('fileName')}
      />
      <Button type="submit" disabled={!form.isDirty()}>
        Zaktualizuj
      </Button>
    </Stack>
  );
};

export default EditForm;
