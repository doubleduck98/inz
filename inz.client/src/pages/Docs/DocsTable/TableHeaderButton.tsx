import { Table, Text, UnstyledButton, Group, Center } from '@mantine/core';
import {
  IconChevronUp,
  IconChevronDown,
  IconSelector,
} from '@tabler/icons-react';
import classes from './Docs.module.css';

interface TableHeaderButtonProps {
  children: React.ReactNode;
  reversed: boolean;
  sorted: boolean;
  onSort: () => void;
  width?: string | number;
}

const TableHeaderButton = ({
  children,
  reversed,
  sorted,
  onSort,
  width,
}: TableHeaderButtonProps) => {
  const Icon = sorted
    ? reversed
      ? IconChevronUp
      : IconChevronDown
    : IconSelector;
  return (
    <Table.Th w={width} className={classes.th}>
      <UnstyledButton onClick={onSort} className={classes.control}>
        <Group justify="space-between" wrap="nowrap">
          <Text fw={500} fz="sm">
            {children}
          </Text>
          <Center className={classes.icon}>
            <Icon size={16} stroke={1.5} />
          </Center>
        </Group>
      </UnstyledButton>
    </Table.Th>
  );
};

export default TableHeaderButton;
