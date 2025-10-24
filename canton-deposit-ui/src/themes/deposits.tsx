import { createTheme } from '@mui/material';
import cantonHeader from '../assets/cantonHeader.png';
import { Branding } from '../utils/branding';
import baseline from './baseline';

const style = {
  filter: 'invert(1)',
  WebkitFilter: 'invert(1)',
};

const deposits: Branding = {
  headerLogo: <img alt="" src={cantonHeader} height="16px" style={style} />,
  theme: 'deposits'
};

export default { branding: deposits, theme: createTheme(baseline) };
