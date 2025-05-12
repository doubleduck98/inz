import { useEffect, useState } from 'react';

const useCredentials = () => {
  const [credentials, setCredentials] = useState<string>('');

  const saveCredentials = (c: string) => {
    localStorage.setItem('creds', c);
    setCredentials(c);
  };
  const loadCredentials = () => {
    const c = localStorage.getItem('creds');
    if (c) setCredentials(c);
  };
  const removeCredentials = () => {
    localStorage.removeItem('creds');
    setCredentials('');
  };

  useEffect(() => {
    loadCredentials();
  }, []);

  return { credentials, saveCredentials, removeCredentials };
};

export default useCredentials;
