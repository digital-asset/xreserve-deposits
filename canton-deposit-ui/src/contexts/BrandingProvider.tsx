import { PropsWithChildren } from 'react';
import { BrandingContext } from './BrandingContext';
import deposits from '../themes/deposits';

export const BrandingProvider = ({ children }: PropsWithChildren) => {
  return <BrandingContext.Provider value={deposits}>{children}</BrandingContext.Provider>;
};
