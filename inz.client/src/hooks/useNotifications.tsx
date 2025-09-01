import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';

interface UseNotifications {
  showSuccessMessage: (message: string, title?: string) => void;
  showErrorMessage: (message: string, title?: string) => void;
}

const useNotifications = (): UseNotifications => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const showSuccessMessage = (message: string, title: string = 'Sukces') => {
    notifications.show({
      title,
      message,
      icon: <IconCheck size={18} />,
      color: 'green',
      autoClose: 3000,
      position: isMobile ? 'bottom-center' : 'bottom-right',
      style: { width: isMobile ? '100%' : undefined },
    });
  };

  const showErrorMessage = (message: string, title: string = 'Błąd') => {
    notifications.show({
      title,
      message,
      icon: <IconX size={18} />,
      color: 'red',
      autoClose: 3000,
      position: isMobile ? 'bottom-center' : 'bottom-right',
      style: { width: isMobile ? '100%' : undefined },
    });
  };

  return { showSuccessMessage, showErrorMessage };
};

export default useNotifications;
