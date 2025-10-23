import { ThemeOptions } from '@mui/material';

const gray90 = '#D5D7DD';

const baseline: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: { main: '#0D33A0' },
    secondary: { main: '#577FF1' },
  },
  typography: {
    allVariants: {
      fontFamily: "'Lato', sans-serif;",
    },
  },
  components: {
    MuiAccordion: {
      styleOverrides: {
        root: ({ theme }) => ({
          svg: {
            color: theme.palette.text.primary,
          },
        }),
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 1,
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          label: {
            color: '#9e9e9e',
          },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        variant: 'contained',
      },
      styleOverrides: {
        root: {
          textTransform: 'capitalize',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: `
        html, body, #root {
          display: flex;
          width: 100%;
          height: 100%;
          align-items: center;
          justify-content: center;
        }
      `,
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          width: 200,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          zIndex: 0,
        },
        root: {
          width: 200,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          zIndex: 0,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: ({ theme }) => ({
          border: `1px solid ${gray90}`,
          '&.Mui-focused': {
            border: `2px solid ${theme.palette.secondary.main}`,
          },
          svg: {
            color: theme.palette.text.primary,
          },
        }),
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: ({ theme }) => ({
          svg: {
            color: theme.palette.text.primary,
          },
        }),
      },
    },
    MuiOutlinedInput: {
      defaultProps: {
        notched: false,
        fullWidth: true,
      },
      styleOverrides: {
        notchedOutline: {
          border: 'none',
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        labelContainer: {
          color: '#9e9e9e',
        },
      },
    },
    MuiSvgIcon: {
      defaultProps: {
        color: 'primary',
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          variants: [
            {
              props: { variant: 'h1' },
              style: { fontSize: '40px', fontWeight: 'bold', lineHeight: '48px' },
            },
            {
              props: { variant: 'h2' },
              style: { fontSize: '32px', fontWeight: 'medium', lineHeight: '32px' },
            },
            {
              props: { variant: 'h3' },
              style: { fontSize: '24px', fontWeight: 'bold', lineHeight: '30px' },
            },
            {
              props: { variant: 'h4' },
              style: { fontSize: '20px', fontWeight: 'bold', lineHeight: '26px' },
            },
            {
              props: { variant: 'h5' },
              style: { fontSize: '16px', fontWeight: 'semibold', lineHeight: '24px' },
            },
            {
              props: { variant: 'h6' },
              style: { fontSize: '16px', fontWeight: 'bold', lineHeight: '22px' },
            },
          ],
        },
      },
    },
  },
};

export default baseline;
