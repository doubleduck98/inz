import { openConfirmDeleteModal } from '@/components/Modals';
import axiosInstance from '@/utils/Axios';
import {
  Table,
  Group,
  Drawer,
  Center,
  Text,
  Loader,
  Badge,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconClockHour5, IconRestore, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { expBadgeFormat } from '../utils/DocsUtils';
import useNotifications from '@/hooks/useNotifications';

interface DeletedDoc {
  id: number;
  fileName: string;
  deletedOn: string;
}

interface DocumentTrashProps {
  opened: boolean;
  onClose: () => void;
  onRestore: (id: number) => Promise<void>;
  upToDate: React.RefObject<boolean>;
}

const Trash = ({
  opened,
  onClose,
  onRestore,
  upToDate,
}: DocumentTrashProps) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [deletedDocuments, setDeletedDocuments] = useState<DeletedDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const { showSuccessMessage, showErrorMessage } = useNotifications();

  const fetchDeleted = async () => {
    const opts = {
      url: 'Resources/GetDeleted',
      method: 'GET',
    };

    setLoading(true);
    try {
      const { data } = await axiosInstance.request<DeletedDoc[]>(opts);
      setDeletedDocuments(data);
      upToDate.current = true;
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const purgeDocument = async (id: number) => {
    const opts = {
      url: `Resources/Purge/${id}`,
      method: 'DELETE',
    };

    try {
      await axiosInstance.request(opts);
      setDeletedDocuments((prev) => prev.filter((d) => d.id !== id));
      showSuccessMessage('Pomyślnie usunięto plik.');
    } catch {
      showErrorMessage('Błąd przy usuwaniu pliku.');
    }
  };

  const handleDelete = (doc: DeletedDoc) => {
    openConfirmDeleteModal({
      title: 'Potwierdź usunięcie',
      message: `Czy chcesz usunąć ${doc.fileName} na zawsze? Ta operacja jest nieodwracalna.`,
      onConfirm: () => purgeDocument(doc.id),
    });
  };

  const handleRestore = async (id: number) => {
    await onRestore(id);
    setDeletedDocuments((prev) => prev.filter((d) => d.id !== id));
    showSuccessMessage('Pomyślnie przywrócono plik.');
  };

  const handleDrawerOpen = () => {
    if (upToDate.current) {
      return;
    }
    fetchDeleted();
  };

  const rows = deletedDocuments.map((doc) => (
    <Table.Tr key={doc.id}>
      <Table.Td w={isMobile ? '70%' : '62%'}>
        <Text lineClamp={isMobile ? 3 : 2}>{doc.fileName}</Text>
        {isMobile && (
          <Badge
            variant="light"
            color="gray"
            leftSection={<IconClockHour5 size={12} />}
          >
            {expBadgeFormat(doc.deletedOn)} do usunięcia
          </Badge>
        )}
      </Table.Td>
      {!isMobile && (
        <Table.Td>
          <Center>
            <Badge
              variant="light"
              color="gray"
              leftSection={<IconClockHour5 size={12} />}
            >
              {expBadgeFormat(doc.deletedOn)}
            </Badge>
          </Center>
        </Table.Td>
      )}
      <Table.Td>
        <Group gap="xs" wrap="nowrap">
          <Tooltip label="Przywróć">
            <ActionIcon
              variant="light"
              color="gray"
              onClick={() => handleRestore(doc.id)}
            >
              <IconRestore size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Usuń trwale">
            <ActionIcon
              variant="light"
              color="red"
              onClick={() => handleDelete(doc)}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      onEnterTransitionEnd={handleDrawerOpen}
      title="Kosz"
      position="right"
      size={isMobile ? '100%' : 'lg'}
      offset={14}
      radius="md"
      overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
    >
      <Text c="dimmed" mb="md" fz="sm">
        Usunięte dokumenty można przywrócić lub trwale usunąć. Dokumenty, które
        znajdują się w koszu dłużej niż 30 dni, są usuwane automatycznie.
      </Text>

      {loading && (
        <Center h={200}>
          <Loader />
        </Center>
      )}

      {!loading && deletedDocuments.length === 0 && (
        <Center h={200}>
          <Text c="dimmed" fs="italic">
            Kosz jest pusty.
          </Text>
        </Center>
      )}

      {!loading && deletedDocuments.length > 0 && (
        <Table.ScrollContainer minWidth={'100%'} maxHeight={'80vh'}>
          <Table stickyHeader highlightOnHover withColumnBorders layout="fixed">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Dokument</Table.Th>
                {!isMobile && (
                  <Table.Th w="20%" style={{ textAlign: 'center' }}>
                    Do usunięcia
                  </Table.Th>
                )}
                <Table.Th
                  w={isMobile ? '30%' : '15%'}
                  style={{ textAlign: 'center' }}
                >
                  Akcje
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}
    </Drawer>
  );
};

export default Trash;
