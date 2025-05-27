import { useEffect, useState } from 'react';
import { Paitent } from '../../types/Patient';
import axiosInstance from '../../Axios';
import AddForm from './AddForm';
import {
  PatientFormProvider,
  usePatientForm,
  ValidatePatientForm,
} from './patientFormContext';
import classes from './Patients.module.css';
import { randomId, useDisclosure } from '@mantine/hooks';
import dayjs from 'dayjs';
import { Box, Drawer, Grid, Modal } from '@mantine/core';
import { PatientDetails } from './PatientDetails';
import PatientList from './PatientList';
import PatientDetailsDisplay from './PatientDetailsDisplay';

const Patients = () => {
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Paitent[]>([]);
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(
    null
  );
  const [patientLoading, setPatientLoading] = useState(false);
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] =
    useDisclosure(false);

  const getPatients = async () => {
    const opts = {
      url: 'Patients/Get',
      withCredentials: true,
    };

    try {
      const { data } = await axiosInstance.request(opts);
      setPatients(data);
    } catch (e) {
      console.log(e);
    }
  };

  const getPatientDetails = async (id: number) => {
    const opts = {
      url: `Patients/Get/${id}`,
      withCredentials: true,
    };

    try {
      setPatientLoading(true);
      const { data } = await axiosInstance.request(opts);
      setPatientDetails(data);
    } catch (e) {
      console.log(e);
    } finally {
      setPatientLoading(false);
    }
  };

  useEffect(() => {
    getPatients();
  }, []);

  const [active, setActive] = useState(0);
  const form = usePatientForm({
    mode: 'uncontrolled',
    initialValues: {
      name: 'Szymon',
      surname: 'Zienkiewicz',
      dob: dayjs('1998-11-16').toDate(),
      street: '',
      house: '',
      apartment: '',
      zipCode: '',
      city: '',
      province: '',
      patientContact: {
        email: '',
        phone: '',
      },
      hasContacts: false,
      contacts: [{ contactName: '', email: '', phone: '', key: randomId() }],
    },

    validate: (values) => ValidatePatientForm(active, values),
  });

  const handleSubmit = async () => {
    const formData = form.getValues();
    if (!formData.hasContacts) formData.contacts = [];
    console.log(formData);
    const opts = {
      url: 'Patients/Create',
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      withCredentials: true,
      data: formData,
    };

    try {
      const { data } = await axiosInstance.request(opts);
      setPatients([data, ...patients]);
      closeDrawer();
      form.reset();
      setActive(0);
      console.log(data);
    } catch (e) {
      console.error(e);
    }
  };

  const formBody = (
    <PatientFormProvider form={form}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <AddForm active={active} setActive={setActive} />
      </form>
    </PatientFormProvider>
  );

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.surname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePatientClick = (patient: Paitent) => {
    setSelectedPatientId(patient.id);
  };

  useEffect(() => {
    if (selectedPatientId) getPatientDetails(selectedPatientId);
  }, [selectedPatientId]);

  return (
    <>
      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title="Dodaj nowego pacjenta"
      >
        {formBody}
      </Modal>
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        title="Dodaj nowego pacjenta"
        size="100%"
        offset={14}
        radius="md"
        position="right"
        classNames={{ header: classes.drawerHeader }}
      >
        {formBody}
      </Drawer>

      <Box hiddenFrom="sm">
        {selectedPatientId ? (
          <PatientDetailsDisplay
            onBack={() => {
              setSelectedPatientId(null);
            }}
            patient={patientDetails}
            loading={patientLoading}
          />
        ) : (
          <PatientList
            openDrawer={openDrawer}
            searchTerm={searchTerm}
            filteredPatients={filteredPatients}
            onSearchChange={(event) => setSearchTerm(event.currentTarget.value)}
            onPatientClick={handlePatientClick}
            selectedPatientId={selectedPatientId}
          />
        )}
      </Box>

      <Grid visibleFrom="sm">
        <Grid.Col span="auto">
          {selectedPatientId ? (
            <PatientDetailsDisplay
              onBack={() => {
                setSelectedPatientId(null);
              }}
              patient={patientDetails}
              loading={patientLoading}
            />
          ) : (
            <div>xd</div>
          )}
        </Grid.Col>
        <Grid.Col span="content">
          <PatientList
            openModal={openModal}
            searchTerm={searchTerm}
            filteredPatients={filteredPatients}
            onSearchChange={(event) => setSearchTerm(event.currentTarget.value)}
            onPatientClick={handlePatientClick}
            selectedPatientId={selectedPatientId}
          />
        </Grid.Col>
      </Grid>
    </>
  );
};

export default Patients;
