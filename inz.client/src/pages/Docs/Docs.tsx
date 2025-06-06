import { useDisclosure } from '@mantine/hooks';
import UploadForm from './UploadForm/UploadForm';
import {
  UploadFormProvider,
  useUploadForm,
} from './UploadForm/UploadFormContext';
import { EditFormProvider, useEditForm } from './EditForm/EditFormContext';
import EditForm from './EditForm/EditForm';
import ResponsiveDialog from '../../ResponsiveDialog';
import useDocuments from './hooks/useDocuments';
import usePatients from './hooks/usePatients';
import DocsTableContainer from './DocsTable/DocsTableContainer';
import { stripExtension } from './utils/DocsUtils';
import { AxiosError } from 'axios';
import { ApiError } from '../../types/ApiError';

const Docs = () => {
  const {
    docs,
    uploadDocument,
    downloadDocuments,
    editDocument,
    deleteDocument,
    deleteSelectedDocuments,
  } = useDocuments();

  const { patients, setSearchPatients, loadingPatients } = usePatients();

  const [
    uploadDialogOpened,
    { open: openUploadDialog, close: closeUploadDialog },
  ] = useDisclosure(false);
  const [editDialogOpened, { open: openEditDialog, close: closeEditDialog }] =
    useDisclosure(false);

  const form = useUploadForm({
    mode: 'uncontrolled',
    initialValues: {
      patientId: '',
      file: null,
      fileName: '',
    },

    validate: {
      patientId: (val) => (val ? null : 'Proszę wybrać pacjenta'),
      file: (val) => (val ? null : 'Proszę wybrać plik'),
      fileName: (val) => {
        if (!val.length) return 'Proszę podać nazwę';
        if (val.length > 200) return 'Nazwa jest za długa (maks. 200 znaków)';
        return null;
      },
    },
  });

  const editForm = useEditForm({
    initialValues: {
      fileId: 0,
      fileName: '',
      patientId: '',
      patientName: '',
    },

    validate: {
      patientId: (val) => (val ? null : 'Proszę wybrać pacjenta'),
      fileName: (val) => {
        if (!val.length) return 'Proszę podać nazwę';
        if (val.length > 200) return 'Nazwa jest za długa (maks. 200 znaków)';
        return null;
      },
    },
  });

  const onFileChange = (file: File | null) => {
    if (file) form.setValues({ fileName: file.name, file: file });
    else form.setValues({ file: file });
  };

  const handleUpload = async () => {
    const formData = new FormData();
    const file: unknown = form.values.file;
    formData.append('file', file as File);
    formData.append('fileName', form.values.fileName);
    formData.append('patientId', form.values.patientId);

    try {
      await uploadDocument(formData);
      form.reset();
      closeUploadDialog();
    } catch (e) {
      if (e instanceof AxiosError && e.response?.data) {
        const error = e.response.data as ApiError;
        if (error.status === 409) {
          form.setErrors({
            file: ' ',
            fileName: 'Plik o takiej nazwie już istnieje',
          });
        }
      }
    }
  };

  const handleEditClick = (id: number) => {
    const doc = docs.find((d) => d.id === id);
    editForm.setValues({
      fileId: doc?.id,
      fileName: stripExtension(doc?.fileName),
      patientId: '',
      patientName: doc?.patientName,
    });
    openEditDialog();
  };

  const handleEditSubmit = async () => {
    const { fileId, fileName, patientId } = editForm.getValues();
    try {
      await editDocument(fileId, { fileName, patientId });
      editForm.reset();
      closeEditDialog();
    } catch (e) {
      if (e instanceof AxiosError && e.response?.data) {
        const error = e.response.data as ApiError;
        if (error.status === 409) {
          editForm.setErrors({ fileName: 'Plik o takiej nazwie już istnieje' });
        }
      }
    }
  };

  const handleDownloadSelection = async (ids: number[]) => {
    await downloadDocuments(ids);
  };

  const handleDelete = async (id: number) => {
    await deleteDocument(id);
  };

  const handleDeleteSelection = async (ids: number[]) => {
    await deleteSelectedDocuments(ids);
  };

  return (
    <>
      <DocsTableContainer
        docs={docs}
        onDelete={handleDelete}
        onEdit={handleEditClick}
        openUploadDialog={openUploadDialog}
        onDownloadSelection={handleDownloadSelection}
        onDeleteSelection={handleDeleteSelection}
      />

      <ResponsiveDialog
        opened={uploadDialogOpened}
        onClose={closeUploadDialog}
        title="Prześlij dokument"
      >
        <UploadFormProvider form={form}>
          <form onSubmit={form.onSubmit(handleUpload)}>
            <UploadForm
              onFileChange={onFileChange}
              patientsSelect={patients}
              patientsLoading={loadingPatients}
              onSearchChange={(val) => {
                setSearchPatients(val);
              }}
            />
          </form>
        </UploadFormProvider>
      </ResponsiveDialog>

      <ResponsiveDialog
        opened={editDialogOpened}
        onClose={closeEditDialog}
        title="Edytuj dokument"
      >
        <EditFormProvider form={editForm}>
          <form onSubmit={editForm.onSubmit(handleEditSubmit)}>
            <EditForm
              patientsSelect={patients}
              patientsLoading={loadingPatients}
              onSearchChange={(val) => {
                setSearchPatients(val);
              }}
            />
          </form>
        </EditFormProvider>
      </ResponsiveDialog>
    </>
  );
};

export default Docs;
