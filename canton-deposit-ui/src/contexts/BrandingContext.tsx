import React, { useContext } from 'react';
import { Theme } from '@mui/material';
import { Branding } from '../utils/branding';
import deposits from '../themes/deposits';


export type BrandingState = {
  branding: Branding;
  theme: Theme;
};

export const BrandingContext = React.createContext<BrandingState>(deposits);

export const useBranding: () => BrandingState = () => {
  const branding = useContext<BrandingState>(BrandingContext);
  return branding;
};
