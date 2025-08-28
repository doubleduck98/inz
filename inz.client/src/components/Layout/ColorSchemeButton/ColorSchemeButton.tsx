import { IconMoon, IconSun } from '@tabler/icons-react';
import cx from 'clsx';
import {
  ActionIcon,
  Group,
  Tooltip,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import classes from './ColorSchemeButton.module.css';

/**
 * Button component for setting light and dark mode
 */
const ColorSchemeButton = () => {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', {
    getInitialValueInEffect: true,
  });
  const label = computedColorScheme !== 'light' ? 'Tryb jasny' : 'Tryb ciemny';

  return (
    <Group justify="center">
      <Tooltip label={label}>
        <ActionIcon
          onClick={() =>
            setColorScheme(computedColorScheme !== 'light' ? 'light' : 'dark')
          }
          variant="default"
          size="lg"
          radius="md"
          aria-label="Toggle color scheme"
        >
          <IconSun className={cx(classes.icon, classes.light)} stroke={1.5} />
          <IconMoon className={cx(classes.icon, classes.dark)} stroke={1.5} />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
};

export default ColorSchemeButton;
