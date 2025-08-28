import { useState } from 'react';
import { Paitent } from '@/types/Patient';
import AddForm from './AddForm/AddForm';
import {
  AddFormProvider,
  useAddForm,
  ValidatePatientForm,
} from './AddForm/AddFormContext';
import { randomId, useDisclosure, useMediaQuery } from '@mantine/hooks';
import { Center, Container, Grid, Text } from '@mantine/core';
import PatientList from './PatientDisplay/PatientList';
import PatientDetailsDisplay from './PatientDisplay/PatientDetailsDisplay';
import ResponsiveDialog from '@/components/ResponsiveDialog';
import EditForm from './EditForm/EditForm';
import {
  EditFormProvider,
  EditFormValues,
  useEditForm,
  ValidateEditForm,
} from './EditForm/EditFormContext';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/ApiError';
import {
  AddContactFormProvider,
  useAddContactForm,
  ValidateAddConForm,
} from './AddContactForm/AddContactFormContext';
import AddContactForm from './AddContactForm/AddContactForm';
import { usePatients } from './usePatients';
import dayjs from 'dayjs';

const DATE_FORMAT = 'YYYY-MM-DD';

/**
 * Central component for patients page.
 */
const Patients = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [addDialogOpened, { open: openAddDialog, close: closeAddDialog }] =
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
    patients,
    patientsLoading,
    patientDetails,
    detailsLoading,
    addPatient,
    editPatient,
    addContactToPatient,
  } = usePatients();

  const [active, setActive] = useState(0);
  const addForm = useAddForm({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      surname: '',
      dob: null,
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
    formData.dob = dayjs(formData.dob).format(DATE_FORMAT);

    try {
      await addPatient(formData);
      closeAddDialog();
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
    data.dob = dayjs(data.dob).format(DATE_FORMAT);

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
      console.error(e);
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

  return (
    <>
      <Container fluid maw={1300}>
        {isMobile &&
          (selectedPatientId ? (
            <PatientDetailsDisplay
              onBack={() => {
                setSelectedPatientId(null);
              }}
              onEdit={handleEditClick}
              onAddContact={handleAddConClick}
              patient={patientDetails}
              loading={detailsLoading}
            />
          ) : (
            <PatientList
              openDialog={openAddDialog}
              patients={patients}
              loading={patientsLoading}
              onPatientClick={handlePatientClick}
              selectedPatientId={selectedPatientId}
            />
          ))}

        {!isMobile && (
          <Grid>
            <Grid.Col span="auto">
              {selectedPatientId ? (
                <PatientDetailsDisplay
                  onBack={() => {
                    setSelectedPatientId(null);
                  }}
                  onEdit={handleEditClick}
                  onAddContact={handleAddConClick}
                  patient={patientDetails}
                  loading={detailsLoading}
                />
              ) : (
                <Center h="100%" style={{ alignContent: 'center' }}>
                  <Text c="dimmed">Wybierz pacjenta z listy</Text>
                </Center>
              )}
            </Grid.Col>
            <Grid.Col span="content">
              <PatientList
                openDialog={openAddDialog}
                patients={patients}
                loading={patientsLoading}
                onPatientClick={handlePatientClick}
                selectedPatientId={selectedPatientId}
              />
            </Grid.Col>
          </Grid>
        )}
      </Container>

      <ResponsiveDialog
        title="Dodaj nowego pacjenta"
        opened={addDialogOpened}
        onClose={closeAddDialog}
      >
        <AddFormProvider form={addForm}>
          <form onSubmit={addForm.onSubmit(handleAdd)}>
            <AddForm active={active} setActive={setActive} />
          </form>
        </AddFormProvider>
      </ResponsiveDialog>

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
