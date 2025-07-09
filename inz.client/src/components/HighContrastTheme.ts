import { ButtonProps, createTheme, MantineTheme } from '@mantine/core';

export const highContrastTheme = createTheme({
  white: '#ffffff',
  black: '#000000',
  primaryColor: 'yellow',
  primaryShade: 5,
  luminanceThreshold: 0.3,

  colors: {
    yellow: [
      '#ffffe1',
      '#fffdcb',
      '#fffa9a',
      '#fff764',
      '#fff538',
      '#fff31d',
      '#fff200',
      '#e3d700',
      '#c9bf00',
      '#ada500',
    ],
  },

  defaultGradient: {
    from: '#fff538',
    to: '#e3d700',
    deg: 45,
  },

  headings: {
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'bold',
  },

  components: {
    Navbar: {
      styles: (theme: MantineTheme) => ({
        navbar: {
          backgroundColor: theme.colors.dark[8],
          color: theme.colors.yellow[5],
        },
      }),
    },

    Button: {
      styles: (theme: MantineTheme, props: ButtonProps) => {
        if (props.disabled) {
          return {
            root: { backgroundColor: theme.colors.dark[2] },
          };
        }
        return {
          root: {
            backgroundColor: theme.colors.yellow[5],
            color: theme.black,
            border: theme.white,
          },
        };
      },
    },

    Input: {
      styles: (theme: MantineTheme) => ({
        input: {
          color: theme.colors.yellow[5],
          backgroundColor: theme.colors.dark[8],
          border: '2px solid ' + theme.white,
          '&:focus': {
            borderColor: theme.colors.yellow[5],
            outline: '2px solid ' + theme.colors.yellow[3],
          },
        },
        label: {
          color: theme.white,
        },
      }),
    },

    Combobox: {
      styles: (theme: MantineTheme) => ({
        dropdown: {
          backgroundColor: theme.colors.dark[8],
          color: theme.colors.yellow[5],
          border: '2px solid ' + theme.white,
        },
      }),
    },

    Paper: {
      styles: (theme: MantineTheme) => ({
        root: {
          backgroundColor: theme.colors.dark[8],
          backgroundImage: 'none',
          color: theme.colors.yellow[5],
          border: '2px solid ' + theme.white,
        },
      }),
    },

    Box: {
      styles: (theme: MantineTheme) => ({
        root: {
          backgroundColor: theme.colors.dark[8],
          backgroundImage: 'none',
          color: theme.colors.yellow[5],
          border: '2px solid ' + theme.white,
        },
      }),
    },

    Tooltip: {
      styles: (theme: MantineTheme) => ({
        tooltip: {
          backgroundColor: theme.colors.yellow[5],
          color: theme.black,
          border: '1px solid ' + theme.black,
        },
      }),
    },

    Modal: {
      styles: (theme: MantineTheme) => ({
        header: {
          backgroundColor: theme.colors.dark[8],
          color: theme.colors.yellow,
          padding: '1rem',
        },
      }),
    },

    Drawer: {
      styles: (theme: MantineTheme) => ({
        header: {
          backgroundColor: theme.colors.dark[8],
          color: theme.colors.yellow,
          padding: '1rem',
        },
      }),
    },

    Badge: {
      styles: (theme: MantineTheme) => ({
        root: {
          color: theme.colors.dark[8],
        },
      }),
    },

    Pill: {
      styles: (theme: MantineTheme) => ({
        label: {
          color: theme.colors.yellow[5],
        },
      }),
    },

    Title: {
      styles: (theme: MantineTheme) => ({
        text: {
          color: theme.colors.yellow[5],
        },
      }),
    },

    Checkbox: {
      styles: (theme: MantineTheme) => ({
        icon: {
          color: theme.colors.dark[8],
        },
      }),
    },

    Dropzone: {
      styles: (theme: MantineTheme) => ({
        root: {
          backgroundColor: theme.colors.dark[8],
          border: '2px dashed ' + theme.white,
          color: theme.white,
        },
      }),
    },

    Calendar: {
      styles: (theme: MantineTheme) => ({
        day: {
          color: theme.colors.dark[8],
          fontWeight: '550',
        },
      }),
    },
  },
});
