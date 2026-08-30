import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#D4AF37', // Gold
      light: '#F3E5AB',
      dark: '#AA8C2C',
      contrastText: '#1A0B30',
    },
    secondary: {
      main: '#A855F7', // Violet accent
    },
    background: {
      default: 'transparent',
      paper: '#211042',
    },
    text: {
      primary: '#F6F1FF',
      secondary: '#C4B5D4',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontFamily: '"Roboto", sans-serif', fontWeight: 900 },
    h2: { fontFamily: '"Roboto", sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"Roboto", sans-serif', fontWeight: 700 },
    h4: { fontFamily: '"Roboto", sans-serif', fontWeight: 700 },
    h5: { fontFamily: '"Roboto", sans-serif', fontWeight: 700 },
    h6: { fontFamily: '"Roboto", sans-serif', fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600, fontFamily: '"Roboto", sans-serif' }
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(22, 6, 46, 0.7)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
          color: '#F6F1FF',
        }
      }
    }
  }
});

export default theme;
