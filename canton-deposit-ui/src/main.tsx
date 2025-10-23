import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { BrandingProvider } from './contexts/BrandingProvider';
import { DarkLightModeProvider } from './contexts/DarkLightModeProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrandingProvider>
      <DarkLightModeProvider>
        <App />
      </DarkLightModeProvider>
    </BrandingProvider>
  </React.StrictMode>,
);
