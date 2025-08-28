import { Drawer, Modal } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { ReactNode } from 'react';

interface ResponsiveDialogProps {
  children: ReactNode;
  title: string;
  opened: boolean;
  onClose: () => void;
}

/**
 * Responsive dialog component rendering modal window in bigger viewports
 * and drawer component in mobile viewports.
 */
const ResponsiveDialog = ({
  children,
  title,
  opened,
  onClose,
}: ResponsiveDialogProps) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  if (isMobile)
    return (
      <Drawer
        opened={opened}
        onClose={onClose}
        title={title}
        size="100%"
        offset={14}
        radius="md"
        position="right"
      >
        {children}
      </Drawer>
    );

  return (
    <Modal opened={opened} onClose={onClose} title={title}>
      {children}
    </Modal>
  );
};

export default ResponsiveDialog;
