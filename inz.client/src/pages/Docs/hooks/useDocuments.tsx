import { useState, useEffect, useRef } from 'react';
import axiosInstance from '@/utils/Axios';
import { Doc } from '@/types/Doc';
import { AxiosProgressEvent, AxiosResponseHeaders } from 'axios';
import { UploadStatus } from '../types/UploadStatus';

interface UseDocuments {
  docs: Doc[];
  loading: boolean;
  uploadDocument: (formData: FormData) => Promise<void>;
  uploadStatus: UploadStatus;
  uploadProgress: number;
  downloadDocument: (id: number) => Promise<void>;
  downloadDocuments: (ids: number[]) => Promise<void>;
  editDocument: (
    id: number,
    newFile: { fileName: string; patientId: number }
  ) => Promise<void>;
  deleteDocument: (id: number) => Promise<void>;
  deleteSelectedDocuments: (ids: number[]) => Promise<void>;
  restoreDocument: (id: number) => Promise<void>;
  trashUpToDate: React.RefObject<boolean>;
}

/**
 * Hook for managing documents state.
 */
const useDocuments = (): UseDocuments => {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('waiting');
  const [uploadProgress, setUploadProgress] = useState(0);
  const trashUpToDate = useRef(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      const opts = {
        url: 'Resources/Get',
        method: 'GET',
      };

      setLoading(true);
      try {
        const { data } = await axiosInstance.request(opts);
        setDocs(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const uploadDocument = async (formData: FormData) => {
    const opts = {
      url: 'Resources/Create',
      method: 'POST',
      headers: { 'content-type': 'multipart/form-data' },
      data: formData,
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        const progress = progressEvent.total
          ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
          : 0;
        setUploadProgress(progress);
      },
    };

    setUploadStatus('uploading');
    setUploadProgress(0);
    try {
      const { data } = await axiosInstance.request<Doc>(opts);
      setDocs((prevDocs) => [data, ...prevDocs]);
      setUploadStatus('uploaded');
    } catch (e) {
      setUploadStatus('waiting');
      console.error('Error uploading document:', e);
      throw e;
    } finally {
      setTimeout(() => {
        setUploadStatus('waiting');
        setUploadProgress(0);
      }, 500);
    }
  };

  const downloadDocument = async (id: number) => {
    const opts = {
      url: `Resources/Download/${id}`,
      method: 'GET',
    };

    try {
      const { data, headers } = await axiosInstance.request<Blob>({
        ...opts,
        responseType: 'blob',
      });
      getFile(data, headers as AxiosResponseHeaders);
    } catch (e) {
      console.error(e);
    }
  };

  const downloadDocuments = async (ids: number[]) => {
    const opts = {
      url: 'Resources/Download',
      method: 'GET',
      params: { ids: ids },
      paramsSerializer: { indexes: null },
    };

    try {
      const { data, headers } = await axiosInstance.request<Blob>({
        ...opts,
        responseType: 'blob',
      });

      getFile(data, headers as AxiosResponseHeaders);
    } catch (e) {
      console.error(e);
    }
  };

  const getFile = (data: Blob, headers: AxiosResponseHeaders) => {
    const href = URL.createObjectURL(data);
    const link = document.createElement('a');
    const content = headers['content-disposition'];

    link.href = href;
    if (headers['content-type'] === 'application/octet-stream') {
      const match = content.match(/filename\*=UTF-8''(.+)/)?.[1] || null;
      link.download = match ? decodeURIComponent(match) : 'pobrany_plik';
    } else {
      link.download =
        content.match(/filename="(.+)"/)?.[1] || 'pobrane_pliki.zip';
    }
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

  const editDocument = async (
    id: number,
    newFile: { fileName: string; patientId: number }
  ) => {
    const opts = {
      url: `Resources/Edit/${id}`,
      method: 'PUT',
      data: newFile,
    };

    try {
      const { data } = await axiosInstance.request(opts);
      setDocs((prev) => prev.map((doc) => (doc.id === id ? data : doc)));
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const deleteDocument = async (id: number) => {
    const opts = {
      url: `Resources/Delete/${id}`,
      method: 'DELETE',
    };

    try {
      await axiosInstance.request(opts);
      setDocs((prevDocs) => prevDocs.filter((d) => d.id !== id));
      trashUpToDate.current = false;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const deleteSelectedDocuments = async (ids: number[]) => {
    const opts = {
      url: `Resources/Delete/`,
      method: 'DELETE',
      data: {
        ids: ids,
      },
    };

    try {
      await axiosInstance.request(opts);
      setDocs((prevDocs) => prevDocs.filter((d) => !ids.includes(d.id)));
      trashUpToDate.current = false;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const restoreDocument = async (id: number) => {
    const opts = {
      url: `Resources/Restore/${id}`,
      method: 'POST',
    };

    try {
      const { data } = await axiosInstance.request(opts);
      setDocs((prev) => [data, ...prev]);
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  return {
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
    restoreDocument,
    trashUpToDate,
  };
};

export default useDocuments;
