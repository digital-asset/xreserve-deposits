import React, { useState, useRef } from 'react';
import { Buffer } from 'buffer';
import { Contract, BrowserProvider, parseUnits, keccak256, Signer } from 'ethers';
import { useAppKit, useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  CircularProgress,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import baseline from './themes/baseline';
import { useBranding } from './contexts/BrandingContext';
import { DISCLAIMER_TEXT } from './constants/disclaimer';

(window as any).Buffer = Buffer;

const config = {
  ETH_RPC_URL: (import.meta.env.VITE_ETH_RPC_URL as string),
  ETHERSCAN_TX_PREFIX: (import.meta.env.VITE_ETHERSCAN_TX_PREFIX as string),
  X_RESERVE_CONTRACT: (import.meta.env.VITE_X_RESERVE_CONTRACT as string),
  ETH_USDC_CONTRACT: (import.meta.env.VITE_ETH_USDC_CONTRACT as string),
  CANTON_DOMAIN: Number(import.meta.env.VITE_CANTON_DOMAIN ?? 10001),
  MAX_FEE: (import.meta.env.VITE_MAX_FEE as string) ?? '0',
};

const X_RESERVE_ABI = [
  'function depositToRemote(uint256 value, uint32 remoteDomain, bytes32 remoteRecipient, address localToken, uint256 maxFee, bytes calldata hookData) external',
];
const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function balanceOf(address account) external view returns (uint256)',
];

export const App: React.FC = () => {
  const branding = useBranding();
  const { open } = useAppKit();
  const { address: connectedAddress, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider('eip155');
  
  const balancesLoaded = useRef(false);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);
  const [address, setAddress] = useState<string>('');
  const [ethBalance, setEthBalance] = useState<string>('');
  const [usdcBalance, setUsdcBalance] = useState<string>('');
  const [status, setStatus] = useState<string>('Ready');
  const [loading, setLoading] = useState<boolean>(false);

  const [approveHash, setApproveHash] = useState<string | null>(null);
  const [depositHash, setDepositHash] = useState<string | null>(null);

  const [amount, setAmount] = useState<string>('');
  const [recipient, setRecipient] = useState<string>('');

  // Disclaimer modal state
  const [disclaimerOpen, setDisclaimerOpen] = useState<boolean>(false);

  // Check if user has acknowledged disclaimer
  React.useEffect(() => {
    const acknowledged = localStorage.getItem('disclaimerAcknowledged');
    if (!acknowledged) {
      setDisclaimerOpen(true);
    }
  }, []);

  const handleAcknowledgeDisclaimer = () => {
    localStorage.setItem('disclaimerAcknowledged', 'true');
    setDisclaimerOpen(false);
  };

  const updateStatus = (m: string) => {
    setStatus(m);
    console.log(m);
  };

  // Sync wallet connection state
  React.useEffect(() => {
    if (isConnected && connectedAddress && walletProvider) {
      const initProvider = async () => {
        try {
          const p = new BrowserProvider(walletProvider as any);
          const s = await p.getSigner();
          setProvider(p);
          setSigner(s);
          setAddress(connectedAddress);
          await checkBalances(p, connectedAddress);
        } catch (err: any) {
          console.error('Error initializing provider:', err);
          updateStatus(`❌ Error: ${err?.message || 'Failed to initialize provider'}`);
        }
      };
      initProvider();
    } else {
      setProvider(null);
      setSigner(null);
      setAddress('');
      setEthBalance('');
      setUsdcBalance('');
      setApproveHash(null);
      setDepositHash(null);
      balancesLoaded.current = false;
      if (!isConnected) {
        setStatus('Ready');
      }
    }
  }, [isConnected, connectedAddress, walletProvider]);

  const connectWallet = async () => {
    open();
  };

  const checkBalances = async (p: BrowserProvider, addr: string) => {
    if (!p) return;
    try {
      const tokenContract = new Contract(config.ETH_USDC_CONTRACT, ERC20_ABI, p);
      const nativeBalance = await p.getBalance(addr);
      setEthBalance((Number(nativeBalance) / 1e18).toFixed(6));
      const usdc = await tokenContract.balanceOf(addr);
      setUsdcBalance((Number(usdc) / 1e6).toFixed(6));
      if (!balancesLoaded.current) {
        updateStatus('Balances loaded.')
        balancesLoaded.current = true;
      };
    } catch (err: any) {
      console.error(err);
      if (!balancesLoaded.current) {
        updateStatus('Failed to load balances.');
      }
    }
  };

  const handleDeposit = async () => {
    setApproveHash(null);
    setDepositHash(null);
    if (!signer || !provider) {
      updateStatus('❌ Error: Wallet not connected.');
      return;
    }

    if (!amount) {
      updateStatus('❌ Error: Please enter a deposit amount.');
      return;
    }

    let value: bigint;
    try {
      value = parseUnits(amount, 6);
    } catch {
      updateStatus('❌ Error: Invalid amount. Use a number like 1.5');
      return;
    }

    if (value <= 0n) {
      updateStatus('❌ Error: Amount must be greater than 0.');
      return;
    }

    const recipientString = recipient.trim();
    if (!recipientString) {
      updateStatus('❌ Error: Please enter a Canton recipient address.');
      return;
    }

    setLoading(true);
    try {
      const xReserveContract = new Contract(config.X_RESERVE_CONTRACT, X_RESERVE_ABI, signer);
      const tokenContract = new Contract(config.ETH_USDC_CONTRACT, ERC20_ABI, signer);
      const maxFee = parseUnits(config.MAX_FEE, 6);

      const remoteRecipientBytes32 = keccak256(Buffer.from(recipientString, 'utf8'));
      const hookData = '0x' + Buffer.from(recipientString, 'utf8').toString('hex');

      updateStatus('Checking USDC balance...');
      const usdcBal = await tokenContract.balanceOf(await signer.getAddress());
      if (usdcBal < value) {
        updateStatus('❌ Error: Insufficient USDC balance.');
        setLoading(false);
        return;
      }

      updateStatus('Please approve USDC spending in your wallet...');
      const approveTx = await tokenContract.approve(config.X_RESERVE_CONTRACT, value);
      setApproveHash(approveTx.hash);
      updateStatus(`Approval transaction sent: ${approveTx.hash}`);
      await approveTx.wait();

      updateStatus('Approval successful! Please approve USDC deposit in your wallet...');
      const tx = await xReserveContract.depositToRemote(
        value,
        config.CANTON_DOMAIN,
        remoteRecipientBytes32,
        config.ETH_USDC_CONTRACT,
        maxFee,
        hookData,
      );

      setDepositHash(tx.hash);
      updateStatus(`Deposit transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      updateStatus(
        `✅ Transaction confirmed in block: ${receipt.blockNumber}`
      );
      await checkBalances(provider, await signer.getAddress());
      setAmount('');
    } catch (err: any) {
      console.error(err);
      if (err?.code === 'ACTION_REJECTED') {
        updateStatus('User rejected the transaction.');
      } else {
        updateStatus(`❌ Error: ${err?.message || String(err)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const theme = createTheme(baseline as any, (branding && branding.theme) || {});

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      <Dialog
        open={disclaimerOpen}
        maxWidth="md"
        fullWidth
        disableEscapeKeyDown
        aria-labelledby="disclaimer-dialog-title"
      >
        <DialogTitle id="disclaimer-dialog-title" sx={{ pb: 1 }}>
          Terms and Conditions
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {DISCLAIMER_TEXT}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleAcknowledgeDisclaimer}
            variant="contained"
            fullWidth
            sx={{
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            I Acknowledge
          </Button>
        </DialogActions>
      </Dialog>

      <Container
        maxWidth="xl"
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'center',
          minHeight: '100vh',
          height: '90vh',
          pt: 15,
        }}
        id="app"
      >
        <Container
          maxWidth="lg"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: '100%',
            minHeight: '100vh',
            height: '90vh',
            px: 2,
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 840, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {branding?.branding?.headerLogo}
            <Typography component="h1" variant="h4" sx={{ mt: 4, mb: 2 }}>
              USDC Deposits
            </Typography>

            {!address ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, width: '100%' }}>
                <Button
                  onClick={connectWallet}
                  disabled={loading}
                  fullWidth
                  sx={(t) => ({
                    mt: 1.5,
                    mb: 1,
                    px: 2,
                    py: 1.25,
                    bgcolor: t.palette.primary.main,
                    color: t.palette.primary.contrastText,
                    '&:hover': { bgcolor: t.palette.primary.dark },
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 1,
                    maxWidth: 320,
                  })}
                >
                  {loading ? <CircularProgress size={18} color="inherit" /> : 'Connect Wallet'}
                </Button>
              </Box>
            ) : (
              <Box sx={{ mb: 2, textAlign: 'center', width: '100%' }}>
                <Typography variant="subtitle1" noWrap>
                  {address}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>ETH: {ethBalance} • USDC: {usdcBalance}</Typography>
                <Button
                  onClick={() => open()}
                  variant="outlined"
                  size="small"
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.875rem',
                  }}
                >
                  Disconnect
                </Button>
              </Box>
            )}

            <Box component="form" sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
              <TextField
                label="Amount (USDC)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                variant="outlined"
                fullWidth
                disabled={loading}
                sx={{ maxWidth: 800, mx: 'auto'  }}
              />
              <TextField
                label="Canton recipient party ID"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                variant="outlined"
                fullWidth
                disabled={loading}
                sx={{ maxWidth: 800, mx: 'auto'  }}
              />
              <Button
                onClick={handleDeposit}
                disabled={loading || !address}
                fullWidth
                sx={(t) => ({
                  mt: 0.5,
                  px: 2,
                  py: 1.25,
                  bgcolor: t.palette.primary.main,
                  color: t.palette.primary.contrastText,
                  '&:hover': { bgcolor: t.palette.primary.dark },
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 1,
                  maxWidth: 320,
                  mx: 'auto',
                })}
              >
                {loading ? <CircularProgress size={18} color="inherit" /> : 'Deposit'}
              </Button>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary" component="div" sx={{ whiteSpace: 'pre-wrap', mx: 'auto' }}>
                {status}
              </Typography>
               <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
                 {approveHash && (
                   <Link href={`${config.ETHERSCAN_TX_PREFIX}${approveHash}`} target="_blank" rel="noopener noreferrer">
                     View approval tx on Etherscan
                   </Link>
                 )}
                 {depositHash && (
                   <Link href={`${config.ETHERSCAN_TX_PREFIX}${depositHash}`} target="_blank" rel="noopener noreferrer">
                     View deposit tx on Etherscan
                   </Link>
                 )}
               </Box>
            </Box>

            <Box sx={{ mt: 4, mb: 2 }}>
              <Link
                component="button"
                variant="body2"
                onClick={() => setDisclaimerOpen(true)}
                sx={{
                  color: 'text.secondary',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Terms and Conditions
              </Link>
            </Box>
          </Box>
        </Container>
      </Container>
    </ThemeProvider>
  );
};

export default App;
