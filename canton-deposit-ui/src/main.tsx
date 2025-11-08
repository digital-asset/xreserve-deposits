import React from 'react';
import ReactDOM from 'react-dom/client';
import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { mainnet, sepolia } from '@reown/appkit/networks'
import { App } from './App';
import { BrandingProvider } from './contexts/BrandingProvider';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string;
const ethersAdapter = new EthersAdapter()

const mainnetWithRpc = {
  ...mainnet,
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_MAINNET_RPC_URL as string],
    },
  },
};

const sepoliaWithRpc = {
  ...sepolia,
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_SEPOLIA_RPC_URL as string],
    },
  },
};

createAppKit({
  adapters: [ethersAdapter],
  networks: [mainnetWithRpc, sepoliaWithRpc],
  defaultNetwork: mainnetWithRpc,
  metadata: {
    name: 'Canton Deposits',
    description: 'USDC Deposits to Canton Network via xReserve',
    url: typeof window !== 'undefined'
      ? new URL(import.meta.env.BASE_URL || '/', window.location.origin).toString()
      : '',
    icons: [
      typeof window !== 'undefined'
        ? new URL(
            `${(import.meta.env.BASE_URL as string) || '/'}canton.webp`,
            window.location.origin
          ).toString()
        : ''
    ]
  },
  projectId,
  features: {
    analytics: false,
    socials: false,
    email: false,
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrandingProvider>
        <App />
    </BrandingProvider>
  </React.StrictMode>,
);
