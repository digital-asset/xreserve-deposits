# Circle USDC xReserve Deposits

Interact with Ethereum to deposit USDC into Circle’s xReserve contract and trigger a deposit attestation on Canton Network. Once the attestation is observed on Canton, the specified party ID can mint the equivalent USDCx on Canton Network.

Because of Ethereum finality, expect roughly a 15 minute delay between depositing USDC into the xReserve contract and the Canton Network deposit attestation being created.

## What’s in this repo

This repository includes three ways to perform the deposit:

- canton-deposit-script — a simple TypeScript script demonstrating a direct deposit call
- canton-deposit-script-v2 — a slightly more advanced script with separated configuration and clearer transaction flow
- canton-deposit-ui — a minimal web UI that connects to a browser wallet to perform the deposit
- deposit-intent-hash — a utility to derive the deposit intent message hash from completed xReserve deposit transactions, useful for retrieving attestations from the Circle xReserve API

Each subproject contains its own README with detailed setup and usage instructions.

## Prerequisites

- Node.js 
- Access to Ethereum (RPC URL; Sepolia testnet or Mainnet)
- USDC on the selected network (for Sepolia testing, use https://faucet.circle.com)

## Quick start

### 1) Script (basic)

1. cd canton-deposit-script
2. Install dependencies: yarn install
3. Create .env with PRIVATE_KEY=<your_private_key>
4. Adjust values in depositToRemote_canton.ts as needed
5. Run: npx ts-node depositToRemote_canton.ts

See canton-deposit-script/README.md for details.

### 2) Script (advanced)

1. cd canton-deposit-script-v2
2. Install dependencies: yarn install
3. Configure config_canton.ts (addresses, amounts, signer address, etc.)
4. Run: npx ts-node depositToRemote_canton_advanced.ts

See canton-deposit-script-v2/README.md for details.

### 3) Web UI

1. cd canton-deposit-ui
2. Install dependencies: npm i
3. Configure .env with the required variables (examples derived from usage in the code):
	- VITE_ETH_RPC_URL
	- VITE_ETHERSCAN_TX_PREFIX
	- VITE_X_RESERVE_CONTRACT
	- VITE_ETH_USDC_CONTRACT
	- VITE_CANTON_DOMAIN
	- VITE_MAX_FEE
4. Start the dev server: npm run dev

See canton-deposit-ui/README.md for details.

### 4) Deposit Intent Hash Utility

1. cd deposit-intent-hash
2. Install dependencies: yarn install
3. Run: yarn derive <tx-hash> [options]
   - Use --rpc <url> to specify RPC endpoint
   - Use --domain N to specify source domain (default: 0 for Ethereum)
   - Use --event-index N to specify event log index (auto-detects if omitted)
4. Use the returned message hash to retrieve attestation from Circle xReserve API:
   curl https://xreserve-api.circle.com/v1/attestations/<message-hash>

See deposit-intent-hash/README.md for details.

## Notes and caveats

- Do not commit secrets (e.g., PRIVATE_KEY). Use environment variables and secret storage best practices.
- Gas fees apply on Ethereum; make sure the sender has sufficient ETH.

## License

See the LICENSE file at the repository root.
