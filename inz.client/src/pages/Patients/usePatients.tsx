import { useState, useCallback, useEffect, useMemo } from 'react';
import axiosInstance from '../../Axios';
import { Paitent } from '../../types/Patient';
import { PatientDetails } from './PatientDisplay/PatientDetails';
import { AddFormValues } from './AddForm/AddFormContext';
import { EditFormValues } from './EditForm/EditFormContext';
import { AddContactFormValues } from './AddContactForm/AddContactFormContext';

interface UsePatients {
  selectedPatientId: number | null;
  setSelectedPatientId: (id: number | null) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  patients: Paitent[];
  filteredPatients: Paitent[];
  patientDetails: PatientDetails | null;
  patientLoading: boolean;
  addPatient: (patientData: AddFormValues) => Promise<void>;
  editPatient: (patientData: EditFormValues) => Promise<void>;
  addContactToPatient: (contactData: AddContactFormValues) => Promise<void>;
}

export const usePatients = (): UsePatients => {
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Paitent[]>([]);
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(
    null
  );
  const [patientLoading, setPatientLoading] = useState(false);

  const getPatients = useCallback(async () => {
    const opts = {
      url: 'Patients/Get',
      withCredentials: true,
    };
    const { data } = await axiosInstance.request(opts);
    setPatients(data);
  }, []);

  const getPatientDetails = useCallback(async (id: number) => {
    try {
      setPatientLoading(true);
      const opts = {
        url: `Patients/Get/${id}`,
        withCredentials: true,
      };
      const { data } = await axiosInstance.request(opts);
      setPatientDetails(data);
    } finally {
      setPatientLoading(false);
    }
  }, []);

  const addPatient = useCallback(async (patientData: AddFormValues) => {
    const opts = {
      url: 'Patients/Create',
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      withCredentials: true,
      data: patientData,
    };

    const { data } = await axiosInstance.request(opts);
    setPatients((prevPatients) => [data, ...prevPatients]);
  }, []);

  const editPatient = useCallback(async (patientData: EditFormValues) => {
    const opts = {
      url: `Patients/Edit/${patientData.id}`,
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      withCredentials: true,
      data: patientData,
    };

    const { data: updatedPatientData } = await axiosInstance.request(opts);

    setPatientDetails((prevDetails) => {
      if (!prevDetails) return null;
      return {
        ...prevDetails,
        ...updatedPatientData,
      };
    });

    setPatients((prev) => {
      const next = [...prev];
      const i = prev.findIndex((p) => p.id === updatedPatientData.id);
      if (i >= 0) {
        next[i] = {
          ...next[i],
          name: updatedPatientData.name,
          surname: updatedPatientData.surname,
          dob: updatedPatientData.dob,
        };
      }
      return next;
    });
  }, []);

  const addContactToPatient = useCallback(
    async (contactData: AddContactFormValues) => {
      const opts = {
        url: `Patients/AddContact/${contactData.id}`,
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        withCredentials: true,
        data: contactData,
      };

      const { data } = await axiosInstance.request(opts);
      setPatientDetails((prevDetails) => {
        if (!prevDetails) return null;
        return {
          ...prevDetails,
          contacts: [data, ...(prevDetails.contacts || [])],
        };
      });
    },
    []
  );

  useEffect(() => {
    getPatients();
  }, [getPatients]);

  useEffect(() => {
    if (selectedPatientId) {
      getPatientDetails(selectedPatientId);
    } else {
      setPatientDetails(null);
    }
  }, [selectedPatientId, getPatientDetails]);

  const filteredPatients = useMemo(() => {
    return patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.surname.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [patients, searchTerm]);

  return {
    selectedPatientId,
    setSelectedPatientId,
    searchTerm,
    setSearchTerm,
    patients,
    filteredPatients,
    patientDetails,
    patientLoading,
    addPatient,
    editPatient,
    addContactToPatient,
  };
};
