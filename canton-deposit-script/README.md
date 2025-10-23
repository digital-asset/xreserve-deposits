# Canton depositToRemote Script

## Setup

1. Install dependencies:

   ```bash
   yarn install
   ```

2. Configure the script by editing the `config` object in `depositToRemote_canton.ts`:
   - Update contract addresses if needed
   - Adjust Canton recipient and domain settings if needed
   - Set the deposit amount

3. Add an `.env` file to the project specifying your private key:

   eg: `PRIVATE_KEY: <private_Key_here>`

   **Important:** Never commit your actual private key!

4. Get testnet USDC:
   - Visit <https://faucet.circle.com/> to get testnet USDC on Ethereum Sepolia

## Running the Script

Run the script with:

```bash
npx ts-node depositToRemote_canton.ts
```
