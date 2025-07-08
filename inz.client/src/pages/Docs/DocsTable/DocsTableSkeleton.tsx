import { Group, Skeleton, Stack, Table } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

const TableSkeleton = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return isMobile ? (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <Table.Tr key={i} py="md">
          <Table.Td w="20" pl="0">
            <Skeleton height={20} circle />
          </Table.Td>
          <Table.Td pt="md">
            <Stack gap="xs">
              <Skeleton height={20} />
              <Skeleton height={6} w="40%" />
            </Stack>
          </Table.Td>
          <Table.Td pr="0" pt="xs">
            <Skeleton height={24} />
          </Table.Td>
        </Table.Tr>
      ))}
    </>
  ) : (
    <>
      {Array.from({ length: 12 }).map((_, i) => (
        <Table.Tr key={i} h={64}>
          <Table.Td w="20">
            <Skeleton height={20} circle />
          </Table.Td>
          <Table.Td>
            <Group>
              <Skeleton height={24} w="6%" />
              <Skeleton height={20} w="60%" />
            </Group>
          </Table.Td>
          <Table.Td>
            <Skeleton height={20} w="40%" />
          </Table.Td>
          <Table.Td>
            <Skeleton height={20} w="60%" />
          </Table.Td>
        </Table.Tr>
      ))}
    </>
  );
};

export default TableSkeleton;
