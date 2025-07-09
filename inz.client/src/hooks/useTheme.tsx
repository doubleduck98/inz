/* eslint-disable react-refresh/only-export-components */
import { highContrastTheme } from '@/components/HighContrastTheme';
import { DEFAULT_THEME, MantineTheme } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { ReactNode, useContext } from 'react';
import { createContext } from 'react';

interface ThemeContextType {
  currentTheme: MantineTheme;
  isHighContrast: boolean;
  setHighContrast: (value: boolean) => void;
}

interface Props {
  children: ReactNode;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: Props) => {
  const [isHighContrast, setContrast] = useLocalStorage({
    key: 'highContrast',
    defaultValue: false,
  });

  const currentTheme = isHighContrast
    ? (highContrastTheme as MantineTheme)
    : DEFAULT_THEME;

  const setHighContrast = (value: boolean) => setContrast(value);

  return (
    <ThemeContext.Provider
      value={{ currentTheme, isHighContrast, setHighContrast }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error();
  }
  return context;
};
