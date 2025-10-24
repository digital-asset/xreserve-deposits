import React from 'react';
import ReactDOM from 'react-dom/client';
import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { mainnet } from '@reown/appkit/networks'
import { App } from './App';
import { BrandingProvider } from './contexts/BrandingProvider';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string;
const ethersAdapter = new EthersAdapter()

createAppKit({
  adapters: [ethersAdapter],
  networks: [mainnet],
  metadata: {
    name: 'Canton Deposits',
    description: 'USDC Deposits to Canton Network via xReserve',
    url: typeof window !== 'undefined' ? window.location.origin : '',
    icons: ['https://avatars.githubusercontent.com/u/179229932']
  },
  projectId,
  features: {
    analytics: false,
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrandingProvider>
        <App />
    </BrandingProvider>
  </React.StrictMode>,
);
