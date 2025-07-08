import { modals } from '@mantine/modals';
import { Text } from '@mantine/core';

interface ConfirmModalOptions {
  title: string;
  message: string | React.ReactNode;
  onConfirm: () => void;
}

export const openConfirmDeleteModal = ({
  title,
  message,
  onConfirm,
}: ConfirmModalOptions) => {
  modals.openConfirmModal({
    title: title,
    children: (
      <Text size="sm" lineClamp={3}>
        {message}
      </Text>
    ),
    labels: { confirm: 'Usuń', cancel: 'Anuluj' },
    confirmProps: { color: 'red' },
    onConfirm: onConfirm,
  });
};
