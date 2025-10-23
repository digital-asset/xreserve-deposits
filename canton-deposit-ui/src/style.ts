import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material';

export default makeStyles()((theme: Theme) => ({
  pageHeader: {
    color: theme.palette.primary.main,
    marginTop: 15,
    marginBottom: 15,
  },

  tableButton: {
    paddingTop: 0,
    paddingBottom: 0,
    marginRight: 5,
    borderRadius: 15,
  },

  actionButton: {
    marginBottom: 4,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 0,
    paddingBottom: 0,
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
      color: theme.palette.text.secondary,
    },
  },

  textField: {
    marginTop: 10,
  },
}));
