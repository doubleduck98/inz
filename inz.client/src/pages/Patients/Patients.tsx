import { useState } from 'react';
import { Paitent } from '../../types/Patient';
import AddForm from './AddForm/AddForm';
import {
  AddFormProvider,
  useAddForm,
  ValidatePatientForm,
} from './AddForm/AddFormContext';
import classes from './Patients.module.css';
import { randomId, useDisclosure } from '@mantine/hooks';
import dayjs from 'dayjs';
import { Box, Drawer, Grid, Modal } from '@mantine/core';
import PatientList from './PatientDisplay/PatientList';
import PatientDetailsDisplay from './PatientDisplay/PatientDetailsDisplay';
import ResponsiveDialog from '../../ResponsiveDialog';
import EditForm from './EditForm/EditForm';
import {
  EditFormProvider,
  EditFormValues,
  useEditForm,
  ValidateEditForm,
} from './EditForm/EditFormContext';
import { AxiosError } from 'axios';
import { ApiError } from '../../types/ApiError';
import {
  AddContactFormProvider,
  useAddContactForm,
  ValidateAddConForm,
} from './AddContactForm/AddContactFormContext';
import AddContactForm from './AddContactForm/AddContactForm';
import { usePatients } from './usePatients';

const Patients = () => {
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const [editDialogOpened, { open: openEditDialog, close: closeEditDialog }] =
    useDisclosure(false);
  const [
    addConDialogOpened,
    { open: openAddConDialog, close: closeAddConDialog },
  ] = useDisclosure(false);

  const {
    selectedPatientId,
    setSelectedPatientId,
    searchTerm,
    setSearchTerm,
    filteredPatients,
    patientDetails,
    patientLoading,
    addPatient,
    editPatient,
    addContactToPatient,
  } = usePatients();

  const [active, setActive] = useState(0);
  const addForm = useAddForm({
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

  const handleAdd = async () => {
    const formData = addForm.getValues();
    if (!formData.hasContacts) formData.contacts = [];

    try {
      await addPatient(formData);
      closeDrawer();
      addForm.reset();
      setActive(0);
    } catch (e) {
      if (e instanceof AxiosError && e.response?.data) {
        const error = e.response.data as ApiError;
        if (error.status === 409) {
          setActive(0);
          addForm.setErrors({
            name: 'Inna osoba o takich danych jest już zarejestrowana',
            surname: ' ',
            dob: ' ',
          });
        }
      }
    }
  };

  const editForm = useEditForm({
    mode: 'uncontrolled',
    initialValues: {
      id: 0,
      name: '',
      surname: '',
      dob: null,
      street: '',
      house: '',
      apartment: null,
      city: '',
      zipCode: '',
      province: '',
      email: null,
      phone: null,
    },

    validate: (values) => ValidateEditForm(values),
  });

  const handleEdit = async () => {
    const data = editForm.getValues();

    try {
      await editPatient(data);
      editForm.reset();
      closeEditDialog();
    } catch (e) {
      if (e instanceof AxiosError && e.response?.data) {
        const error = e.response.data as ApiError;
        if (error.status === 409) {
          editForm.setErrors({
            name: 'Inna osoba o takich danych jest już zarejestrowana',
            surname: ' ',
            dob: ' ',
          });
        }
      }
    }
  };

  const addConForm = useAddContactForm({
    mode: 'uncontrolled',
    initialValues: {
      id: 0,
      name: '',
      email: null,
      phone: null,
    },

    validate: (values) => ValidateAddConForm(values),
  });

  const handleAddCon = async () => {
    const form = addConForm.getValues();

    try {
      await addContactToPatient(form);
      addConForm.reset();
      closeAddConDialog();
    } catch (e) {
      console.log(e);
    }
  };

  const handlePatientClick = (patient: Paitent) => {
    setSelectedPatientId(patient.id);
  };

  const handleEditClick = () => {
    if (!patientDetails) return;
    const newValues: EditFormValues = {
      id: selectedPatientId!,
      name: patientDetails.name,
      surname: patientDetails.surname,
      dob: patientDetails.dob,
      street: patientDetails.street,
      house: patientDetails.house,
      apartment: patientDetails.apartment,
      city: patientDetails.city,
      zipCode: patientDetails.zipCode,
      province: patientDetails.province,
      email: patientDetails.email,
      phone: patientDetails.phone,
    };
    editForm.setInitialValues(newValues);
    editForm.setValues(newValues);
    editForm.resetDirty();
    openEditDialog();
  };

  const handleAddConClick = () => {
    addConForm.setValues({ id: selectedPatientId! });
    openAddConDialog();
  };

  const addFormBody = (
    <AddFormProvider form={addForm}>
      <form onSubmit={addForm.onSubmit(handleAdd)}>
        <AddForm active={active} setActive={setActive} />
      </form>
    </AddFormProvider>
  );

  return (
    <>
      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title="Dodaj nowego pacjenta"
      >
        {addFormBody}
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
        {addFormBody}
      </Drawer>

      <Box hiddenFrom="sm">
        {selectedPatientId ? (
          <PatientDetailsDisplay
            onBack={() => {
              setSelectedPatientId(null);
            }}
            onEdit={handleEditClick}
            onAddContact={handleAddConClick}
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
              onEdit={handleEditClick}
              onAddContact={handleAddConClick}
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

      <ResponsiveDialog
        title={'Edytuj'}
        opened={editDialogOpened}
        onClose={closeEditDialog}
      >
        <EditFormProvider form={editForm}>
          <form onSubmit={editForm.onSubmit(handleEdit)}>
            <EditForm />
          </form>
        </EditFormProvider>
      </ResponsiveDialog>

      <ResponsiveDialog
        title={'Dodaj kontakt'}
        opened={addConDialogOpened}
        onClose={closeAddConDialog}
      >
        <AddContactFormProvider form={addConForm}>
          <form onSubmit={addConForm.onSubmit(handleAddCon)}>
            <AddContactForm />
          </form>
        </AddContactFormProvider>
      </ResponsiveDialog>
    </>
  );
};

export default Patients;
