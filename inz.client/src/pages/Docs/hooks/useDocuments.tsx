import { useState, useCallback, useEffect } from 'react';
import axiosInstance from '../../../Axios';
import { Doc } from '../../../types/Doc';

interface UseDocuments {
  docs: Doc[];
  getDocuments: () => Promise<void>;
  uploadDocument: (formData: FormData) => Promise<Doc | void>;
  downloadDocuments: (ids: number[]) => Promise<void>;
  editDocument: (
    id: number,
    data: { fileName: string; patientId: string }
  ) => Promise<void>;
  deleteDocument: (id: number) => Promise<void>;
  deleteSelectedDocuments: (ids: number[]) => Promise<void>;
  setDocs: React.Dispatch<React.SetStateAction<Doc[]>>;
}

const useDocuments = (): UseDocuments => {
  const [docs, setDocs] = useState<Doc[]>([]);

  const getDocuments = useCallback(async () => {
    const opts = {
      url: 'Resources/Get',
      method: 'GET',
      headers: { 'content-type': 'application/json' },
      withCredentials: true,
    };

    try {
      const { data } = await axiosInstance.request(opts);
      setDocs(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  }, []);

  const uploadDocument = useCallback(async (formData: FormData) => {
    const opts = {
      url: 'Resources/Create',
      method: 'POST',
      headers: { 'content-type': 'multipart/form-data' },
      data: formData,
      withCredentials: true,
    };

    try {
      const { data } = await axiosInstance.request<Doc>(opts);
      setDocs((prevDocs) => [data, ...prevDocs]);
      return data;
    } catch (e) {
      console.error('Error uploading document:', e);
      throw e;
    }
  }, []);

  const downloadDocuments = useCallback(async (ids: number[]) => {
    const opts = {
      url: 'Resources/Download',
      method: 'GET',
      headers: { 'content-type': 'application/json' },
      params: { ids: ids },
      paramsSerializer: { indexes: null },
    };

    try {
      const { data, headers } = await axiosInstance.request<Blob>({
        ...opts,
        responseType: 'blob',
      });

      const href = URL.createObjectURL(data);
      const link = document.createElement('a');
      const content = headers['content-disposition'];

      link.href = href;
      link.download =
        content.match(/filename="(.+)"/)?.[1] || 'downloaded_files.zip';
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(href);
    } catch (e) {
      console.error('Error downloading documents:', e);
    }
  }, []);

  const editDocument = useCallback(
    async (id: number, data: { fileName: string; patientId: string }) => {
      const opts = {
        url: `Resources/Edit/${id}`,
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        data: data,
        withCredentials: true,
      };

      try {
        const { data } = await axiosInstance.request(opts);
        setDocs((prev) => prev.map((doc) => (doc.id === id ? data : doc)));
      } catch (e) {
        console.log(e);
        throw e;
      }
    },
    []
  );

  const deleteDocument = useCallback(async (id: number) => {
    const opts = {
      url: `Resources/Delete/${id}`,
      method: 'DELETE',
      withCredentials: true,
    };

    try {
      await axiosInstance.request(opts);
      setDocs((prevDocs) => prevDocs.filter((d) => d.id !== id));
    } catch (e) {
      console.error('Error deleting document:', e);
      throw e;
    }
  }, []);

  const deleteSelectedDocuments = useCallback(async (ids: number[]) => {
    const opts = {
      url: `Resources/Delete/`,
      method: 'DELETE',
      withCredentials: true,
      data: {
        ids: ids,
      },
    };

    try {
      await axiosInstance.request(opts);
      setDocs((prevDocs) => prevDocs.filter((d) => !ids.includes(d.id)));
    } catch (e) {
      console.error('Error deleting selected documents:', e);
      throw e;
    }
  }, []);

  useEffect(() => {
    getDocuments();
  }, [getDocuments]);

  return {
    docs,
    getDocuments,
    uploadDocument,
    downloadDocuments,
    editDocument,
    deleteDocument,
    deleteSelectedDocuments,
    setDocs,
  };
};

export default useDocuments;
