import { Button, Stack, TextInput } from '@mantine/core';
import PatientSelect from '../components/PatientSelect';
import { Paitent } from '../../../types/Patient';
import { useEditFormContext } from './EditFormContext';

interface EditFormProps {
  patientsSelect: Paitent[];
  patientsLoading: boolean;
  onSearchChange: (s: string) => void;
}

const EditForm = ({
  patientsSelect,
  patientsLoading,
  onSearchChange,
}: EditFormProps) => {
  const form = useEditFormContext();
  return (
    <Stack>
      <PatientSelect
        patients={patientsSelect}
        loading={patientsLoading}
        onSearchChange={onSearchChange}
        form={form}
      />
      <TextInput label="Nazwa dokumentu:" {...form.getInputProps('fileName')} />
      <Button type="submit">Zaktualizuj</Button>
    </Stack>
  );
};

export default EditForm;
