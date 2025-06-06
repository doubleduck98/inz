import { useDebouncedValue } from '@mantine/hooks';
import { useState, useCallback, useEffect } from 'react';
import axiosInstance from '../../../Axios';
import { Paitent } from '../../../types/Patient';

interface UsePatients {
  patients: Paitent[];
  searchPatients: string;
  setSearchPatients: (search: string) => void;
  loadingPatients: boolean;
}

const usePatients = (): UsePatients => {
  const [patients, setPatients] = useState<Paitent[]>([]);
  const [searchPatients, setSearchPatients] = useState('');
  const [searchDebounced] = useDebouncedValue(searchPatients, 300, {
    leading: true,
  });
  const [loadingPatients, setLoading] = useState(false);

  const fetchPatients = useCallback(async () => {
    const opts = {
      url: 'Patients/Get',
      method: 'GET',
      withCredentials: true,
      params: {
        search: searchDebounced,
      },
    };

    try {
      setLoading(true);
      const { data } = await axiosInstance.request(opts);
      setPatients(data);
    } catch (e) {
      console.error('Error fetching patients:', e);
    } finally {
      setLoading(false);
    }
  }, [searchDebounced]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  return {
    patients,
    searchPatients,
    setSearchPatients,
    loadingPatients,
  };
};

export default usePatients;
