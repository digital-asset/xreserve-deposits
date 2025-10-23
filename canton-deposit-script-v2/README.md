# Canton depositToRemote Script

Script for depositing USDC to Canton via the xReserve contract.

## Files

### `config_canton.ts`

Common configuration file containing:

- RPC URLs and network settings
- Contract addresses (xReserve, USDC)
- Signer address 
- Deposit parameters

### `depositToRemote_canton_advanced.ts` (Advanced)

Advanced implementation with separated transaction building and signing.

**Best for:** Production environments using KMS, browser wallets (MetaMask), or hardware wallets (Ledger).

**Key features:**

- Separated signing logic (easy to replace with KMS/wallet service)
- Auto-populates gas, nonce, and chainId
- Clear visibility into transaction hashes

## Setup

1. Install dependencies:

   ```bash
   yarn install
   ```

2. Configure `config_canton.ts`:
   - Set your `SIGNER_ADDRESS` (your Ethereum address)
   - Update contract addresses if needed
   - Adjust Canton recipient and domain settings
   - Set the deposit amount

3. Get testnet USDC:
   - Visit <https://faucet.circle.com> to get testnet USDC on Ethereum Sepolia

## Running the Script

```bash
npx ts-node depositToRemote_canton_advanced.ts
```
