import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { BrandingProvider } from './contexts/BrandingProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrandingProvider>
        <App />
    </BrandingProvider>
  </React.StrictMode>,
);
