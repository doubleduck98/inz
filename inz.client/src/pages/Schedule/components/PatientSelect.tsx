import {
  useCombobox,
  Combobox,
  Loader,
  TextInput,
  CloseButton,
  ScrollArea,
} from '@mantine/core';
import { useCallback, useEffect, useState } from 'react';
import { Paitent } from '../../../types/Patient';
import dayjs from 'dayjs';
import { useDebouncedValue } from '@mantine/hooks';
import axiosInstance from '../../../Axios';

interface PatientSelectProps {
  defaultValue: string;
  errorProps: React.ReactNode;
  setPatientValue: (value: string) => void;
  setPatientIdValue: (value: number | null) => void;
}

const PatientSelect = ({
  defaultValue,
  errorProps,
  setPatientValue,
  setPatientIdValue,
}: PatientSelectProps) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Paitent[] | null>(null);
  const [value, setValue] = useState(defaultValue);
  const [debounced] = useDebouncedValue(value, 333);
  const [canSearch, setCanSearch] = useState(false);
  const [empty, setEmpty] = useState(false);

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: async () => {
      if ((!data || data.length === 0) && !loading) {
        if (!canSearch) setCanSearch(true);
        setLoading(true);
        try {
          const d = await fetchPatients(value);
          console.log(d);
          setData(d);
          setEmpty(d.length === 0);
        } finally {
          setLoading(false);
        }
      }
    },
  });

  const fetchPatients = useCallback(async (search: string | null) => {
    const opts = {
      url: `Patients/Get`,
      method: 'GET',
      withCredentials: true,
      params: { search },
    };

    try {
      const { data } = await axiosInstance.request(opts);
      return data;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }, []);

  useEffect(() => {
    if (!canSearch) return;
    const fetchOptions = async () => {
      setLoading(true);
      try {
        const d = await fetchPatients(debounced);
        setData(d);
        setEmpty(d.length === 0);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [canSearch, debounced, fetchPatients]);

  const patientFmt = (id: string) => {
    const pId = parseInt(id);
    const p = data?.find((p) => p.id == pId);
    return p ? `${p?.name} ${p?.surname}` : '';
  };

  const options = (data || []).map((patient) => {
    return (
      <Combobox.Option value={`${patient.id}`} key={patient.id}>
        {`${patient.name} ${patient.surname}  (${dayjs().diff(patient.dob, 'year')} l.)`}
      </Combobox.Option>
    );
  });

  const rightSection = () => {
    if (loading) return <Loader size={18} />;
    return (
      value && (
        <CloseButton
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            setValue('');
            setPatientIdValue(null);
          }}
        />
      )
    );
  };

  return (
    <Combobox
      onOptionSubmit={(optionValue) => {
        setPatientIdValue(parseInt(optionValue));
        setPatientValue(patientFmt(optionValue));
        setValue(patientFmt(optionValue));
        combobox.closeDropdown();
      }}
      withinPortal={true}
      store={combobox}
    >
      <Combobox.Target>
        <TextInput
          label="Pacjent"
          placeholder="Wyszukaj po imieniu lub nazwisku"
          value={value}
          error={errorProps}
          onChange={(event) => {
            setValue(event.currentTarget.value);
            combobox.resetSelectedOption();
            combobox.openDropdown();
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => {
            combobox.openDropdown();
            if (data === null) {
              fetchPatients(value);
            }
          }}
          onBlur={() => combobox.closeDropdown()}
          rightSection={rightSection()}
        />
      </Combobox.Target>

      <Combobox.Dropdown hidden={data === null}>
        <Combobox.Options>
          <ScrollArea.Autosize mah={200} type="always">
            {options}
            {empty && <Combobox.Empty>Brak wyników</Combobox.Empty>}
          </ScrollArea.Autosize>
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};

export default PatientSelect;
