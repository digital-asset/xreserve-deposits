import React from 'react';

interface DarkLightModeContextProps {
  onToggleDark: () => void;
  isDark: boolean;
}

export const DarkLightModeContext = React.createContext({} as DarkLightModeContextProps);

export const useDarkLightMode = () => React.useContext(DarkLightModeContext);
