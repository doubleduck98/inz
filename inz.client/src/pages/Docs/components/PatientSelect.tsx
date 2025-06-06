import {
  CloseButton,
  Combobox,
  InputBase,
  Loader,
  useCombobox,
} from '@mantine/core';
import { Paitent } from '../../../types/Patient';
import { useState } from 'react';
import dayjs from 'dayjs';
import { UseFormReturnType } from '@mantine/form';

interface PatientSelectProps {
  patients: Paitent[];
  loading: boolean;
  onSearchChange: (s: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturnType<any>;
}

const PatientSelect = ({
  patients,
  loading,
  onSearchChange,
  form,
}: PatientSelectProps) => {
  const options = patients.map((p) => (
    <Combobox.Option key={p.id} value={`${p.id}`}>
      {p.name} {p.surname} ({dayjs().diff(p.dob, 'year')} l.)
    </Combobox.Option>
  ));
  const patientFmt = (id: string) => {
    const pId = parseInt(id);
    const p = patients.find((p) => p.id == pId);
    return `${p?.name} ${p?.surname}`;
  };
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => {},
  });

  const [val, setValue] = useState('');

  const rightSection = () => {
    if (loading) return <Loader size={18} />;
    if (!val) return <Combobox.Chevron />;
    return (
      <CloseButton
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          onSearchChange('');
          setValue('');
        }}
      />
    );
  };

  return (
    <Combobox
      store={combobox}
      withinPortal={false}
      onOptionSubmit={(val) => {
        form.setFieldValue('patientId', val);
        setValue(patientFmt(val));
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <InputBase
          label="Pacjent:"
          placeholder="Proszę wybrać pacjenta"
          value={val}
          pointer
          rightSection={rightSection()}
          onClick={() => combobox.toggleDropdown()}
          rightSectionPointerEvents={val ? 'all' : 'none'}
          onChange={(event) => {
            onSearchChange(event.currentTarget.value);
            setValue(event.currentTarget.value);
            combobox.openDropdown();
          }}
          error={form.getInputProps('patientId').error}
        />
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options mah={200} style={{ overflowY: 'auto' }}>
          {loading ? (
            <Combobox.Empty>Szukam..</Combobox.Empty>
          ) : options.length > 0 ? (
            options
          ) : (
            <Combobox.Empty>Nie znaleziono</Combobox.Empty>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};

export default PatientSelect;
