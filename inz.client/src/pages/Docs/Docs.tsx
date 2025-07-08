import { useDisclosure } from '@mantine/hooks';
import UploadForm from './UploadForm/UploadForm';
import {
  UploadFormProvider,
  useUploadForm,
} from './UploadForm/UploadFormContext';
import { EditFormProvider, useEditForm } from './EditForm/EditFormContext';
import EditForm from './EditForm/EditForm';
import ResponsiveDialog from '@/components/ResponsiveDialog';
import useDocuments from './hooks/useDocuments';
import DocsTableContainer from './DocsTable/DocsTableContainer';
import { stripExtension } from './utils/DocsUtils';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/ApiError';
import { Doc } from '@/types/Doc';

const Docs = () => {
  const {
    docs,
    loading,
    uploadDocument,
    uploadStatus,
    uploadProgress,
    downloadDocument,
    downloadDocuments,
    editDocument,
    deleteDocument,
    deleteSelectedDocuments,
  } = useDocuments();

  const [
    uploadDialogOpened,
    { open: openUploadDialog, close: closeUploadDialog },
  ] = useDisclosure(false);
  const [editDialogOpened, { open: openEditDialog, close: closeEditDialog }] =
    useDisclosure(false);

  const form = useUploadForm({
    initialValues: {
      patientName: '',
      patientId: null,
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
      patientId: null,
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

  const handleUpload = async () => {
    const formData = new FormData();
    const file: unknown = form.values.file;
    formData.append('file', file as File);
    formData.append('fileName', form.values.fileName);
    formData.append('patientId', form.values.patientId!.toString());

    try {
      await uploadDocument(formData);
      // wait a bit for success message display
      setTimeout(() => {
        form.reset();
        closeUploadDialog();
      }, 500);
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

  const handleEditClick = (doc: Doc) => {
    editForm.setValues({
      fileId: doc.id,
      fileName: stripExtension(doc?.fileName),
      patientId: doc?.patientId,
      patientName: doc?.patientName,
    });
    editForm.resetDirty();
    openEditDialog();
  };

  const handleEditSubmit = async () => {
    const { fileId, fileName, patientId } = editForm.getValues();
    const data = {
      fileName: fileName,
      patientId: patientId!,
    };
    try {
      await editDocument(fileId, data);
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

  const handleDelete = async (id: number) => await deleteDocument(id);

  const handleDeleteSelection = async (ids: number[]) =>
    await deleteSelectedDocuments(ids);

  const handleDownload = async (id: number) => await downloadDocument(id);

  const handleDownloadSelection = async (ids: number[]) =>
    await downloadDocuments(ids);

  return (
    <>
      <DocsTableContainer
        docs={docs}
        loading={loading}
        openUploadDialog={openUploadDialog}
        onEdit={handleEditClick}
        onDelete={handleDelete}
        onDeleteSelection={handleDeleteSelection}
        onDownload={handleDownload}
        onDownloadSelection={handleDownloadSelection}
      />

      <ResponsiveDialog
        opened={uploadDialogOpened}
        onClose={closeUploadDialog}
        title="Prześlij dokument"
      >
        <UploadFormProvider form={form}>
          <form onSubmit={form.onSubmit(handleUpload)}>
            <UploadForm
              uploadStatus={uploadStatus}
              uploadProgress={uploadProgress}
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
            <EditForm />
          </form>
        </EditFormProvider>
      </ResponsiveDialog>
    </>
  );
};

export default Docs;
