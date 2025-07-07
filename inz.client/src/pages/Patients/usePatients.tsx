import { useState, useCallback, useEffect } from 'react';
import axiosInstance from '@/utils/Axios';
import { Paitent } from '@/types/Patient';
import { PatientDetails } from './PatientDisplay/PatientDetails';
import { AddFormValues } from './AddForm/AddFormContext';
import { EditFormValues } from './EditForm/EditFormContext';
import { AddContactFormValues } from './AddContactForm/AddContactFormContext';

interface UsePatients {
  selectedPatientId: number | null;
  setSelectedPatientId: (id: number | null) => void;
  patients: Paitent[];
  patientsLoading: boolean;
  patientDetails: PatientDetails | null;
  detailsLoading: boolean;
  addPatient: (patientData: AddFormValues) => Promise<void>;
  editPatient: (patientData: EditFormValues) => Promise<void>;
  addContactToPatient: (contactData: AddContactFormValues) => Promise<void>;
}

export const usePatients = (): UsePatients => {
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    null
  );
  const [patients, setPatients] = useState<Paitent[]>([]);
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(
    null
  );
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [patientsLoading, setPatientsLoading] = useState(false);

  const getPatients = useCallback(async () => {
    const opts = {
      url: 'Patients/Get',
      method: 'GET',
    };
    try {
      setPatientsLoading(true);
      const { data } = await axiosInstance.request(opts);
      setPatients(data);
    } finally {
      setPatientsLoading(false);
    }
  }, []);

  const getPatientDetails = useCallback(async (id: number) => {
    try {
      setDetailsLoading(true);
      const opts = {
        url: `Patients/Get/${id}`,
        method: 'GET',
      };
      const { data } = await axiosInstance.request(opts);
      setPatientDetails(data);
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  const addPatient = async (patientData: AddFormValues) => {
    const opts = {
      url: 'Patients/Create',
      method: 'POST',
      data: patientData,
    };

    const { data } = await axiosInstance.request(opts);
    setPatients((prevPatients) => [data, ...prevPatients]);
  };

  const editPatient = async (patientData: EditFormValues) => {
    const opts = {
      url: `Patients/Edit/${patientData.id}`,
      method: 'PUT',
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
  };

  const addContactToPatient = async (contactData: AddContactFormValues) => {
    const opts = {
      url: `Patients/AddContact/${contactData.id}`,
      method: 'POST',
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
  };

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

  return {
    selectedPatientId,
    setSelectedPatientId,
    patients,
    patientsLoading,
    patientDetails,
    detailsLoading,
    addPatient,
    editPatient,
    addContactToPatient,
  };
};
