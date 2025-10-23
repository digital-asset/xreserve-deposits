import React from 'react';
import { DarkLightModeContext } from './DarkLightModeContext';

interface DarkLightModeProviderProps {
  children: React.ReactNode;
}

export const DarkLightModeProvider: React.FC<DarkLightModeProviderProps> = ({ children }) => {
  const [isDark, setDark] = React.useState(false);

  const onToggleDark = React.useCallback(() => {
    setDark(!isDark);
  }, [isDark]);

  const value = React.useMemo(
    () => ({
      onToggleDark,
      isDark,
    }),
    [onToggleDark, isDark],
  );
  return <DarkLightModeContext.Provider value={value}>{children}</DarkLightModeContext.Provider>;
};
