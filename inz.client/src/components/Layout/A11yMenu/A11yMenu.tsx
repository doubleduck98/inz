import {
  useMantineTheme,
  Menu,
  ActionIcon,
  Group,
  Slider,
  Switch,
  Text,
  Tooltip,
} from '@mantine/core';
import { IconEye, IconZoomIn, IconAccessible } from '@tabler/icons-react';
import useZoom from './useZoom';
import { useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';

const AccesibilityMenu = () => {
  const theme = useMantineTheme();
  const { zoom, setZoom } = useZoom();
  const { isHighContrast, setHighContrast } = useTheme();
  useEffect(() => {
    document.documentElement.style.fontSize = `${zoom}%`;
  }, [zoom]);

  const zoomMarks = [
    { value: 80, label: '80%' },
    { value: 90, label: '90%' },
    { value: 100, label: '100%' },
    { value: 110, label: '110%' },
    { value: 120, label: '120%' },
  ];

  return (
    <Menu shadow="md" withArrow position="bottom-end" closeOnItemClick={false}>
      <Menu.Target>
        <Tooltip label="Ustawienia dostępności">
          <ActionIcon variant="default" size="lg" radius="md">
            <IconAccessible stroke={1.5} />
          </ActionIcon>
        </Tooltip>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Ustaawienia dostępności</Menu.Label>
        <Menu.Item leftSection={<IconEye size={16} />}>
          <Switch
            label="Wysoki kontrast"
            labelPosition="left"
            checked={isHighContrast}
            onChange={(event) => setHighContrast(event.currentTarget.checked)}
          />
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          leftSection={<IconZoomIn size={16} />}
          onClick={(e) => e.preventDefault()}
        >
          <Group h={40}>
            <Text>Powiększenie</Text>
            <Slider
              label={(value) => `${value}%`}
              value={zoom}
              onChange={(value) => {
                setZoom(value);
              }}
              w={180}
              step={10}
              min={80}
              max={120}
              marks={zoomMarks}
              styles={{ markLabel: { fontSize: theme.fontSizes.xs } }}
            />
          </Group>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default AccesibilityMenu;
