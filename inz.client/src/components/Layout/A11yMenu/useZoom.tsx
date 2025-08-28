import { useLocalStorage } from '@mantine/hooks';

interface useZoom {
  zoom: number;
  setZoom: (value: number) => void;
}

/**
 * Hook for keeping state of app zoom, and persisting the setting in local Storage
 */
const useZoom = (): useZoom => {
  const [zoom, storeZoom] = useLocalStorage({
    key: 'zoom',
    defaultValue: 100,
  });

  const setZoom = (value: number) => storeZoom(value);

  return { zoom, setZoom };
};

export default useZoom;
