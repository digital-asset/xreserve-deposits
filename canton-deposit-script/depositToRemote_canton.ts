import { Contract, JsonRpcProvider, Wallet, parseUnits, keccak256 } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config();

// Canton-specific configuration values
const config = {
    // RPC URL - defaults to testnet
    ETH_RPC_URL: 'https://ethereum-sepolia-rpc.publicnode.com', // MAINNET: "https://ethereum-rpc.publicnode.com"

    // Contract addresses (replace with actual deployed addresses)
    X_RESERVE_CONTRACT: '0x008888878f94C0d87defdf0B07f46B93C1934442', // Mainnet: 0x8888888199b2Df864bf678259607d6D5EBb4e3Ce
    ETH_USDC_CONTRACT: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Mainnet USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
    CANTON_USDC: '0x74ed63088c070c8fd5d8ad71f2a1cef868c63d00e0ac6dc2a6722d171691a422', // Mainnet Canton USDC: '0x661237037dc811823d8b2de17aaabb8ef2ac9b713ca7db3b01fc7f7baf7db562'

    // Deposit parameters for Canton
    CANTON_DOMAIN: 10001, // Canton domain ID
    CANTON_RECIPIENT: 'YOUR_CANTON_RECIPIENT_PARTY_ID', // Canton recipient address
    DEPOSIT_AMOUNT: '1.00001', // 1.000001 USDC, will be converted to wei
    MAX_FEE: '0' // 0 fee for Canton
};

// xReserve contract ABI - only the depositToRemote function
const X_RESERVE_ABI = [
    'function depositToRemote(uint256 value, uint32 remoteDomain, bytes32 remoteRecipient, address localToken, uint256 maxFee, bytes calldata hookData) external'
];

// ERC20 contract ABI - only the approve and allowance functions
const ERC20_ABI = [
    'function approve(address spender, uint256 amount) external returns (bool)',
    'function balanceOf(address account) external view returns (uint256)'
];

const privateKey = process.env.PRIVATE_KEY
/**
 * Main function that sends the depositToRemote transaction to Canton
 */
async function main() {
    // Setup provider and wallet
    if (!privateKey) {
      throw "Could not read private key"
    }
    const provider = new JsonRpcProvider(config.ETH_RPC_URL);
    const wallet = new Wallet(privateKey, provider);
    console.log(`Ethereum wallet address: ${wallet.address}`);

    // Setup contract instances
    const xReserveContract = new Contract(config.X_RESERVE_CONTRACT, X_RESERVE_ABI, wallet);
    const tokenContract = new Contract(config.ETH_USDC_CONTRACT, ERC20_ABI, wallet);

    // Prepare transaction parameters (assuming 6 decimals for USDC)
    const value = parseUnits(config.DEPOSIT_AMOUNT, 6);
    const maxFee = parseUnits(config.MAX_FEE, 6);
    const remoteRecipientBytes32 = keccak256(Buffer.from(config.CANTON_RECIPIENT, 'utf8')); // remoteRecipientBytes32 is the keccak256 hash of the Canton party ID
    const hookData = '0x' + Buffer.from(config.CANTON_RECIPIENT, 'utf8').toString('hex'); // hookData is the hex bytes of the Canton party ID

    try {
        console.log(`Depositing ${config.DEPOSIT_AMOUNT} USDC to Canton recipient: ${config.CANTON_RECIPIENT}`);

        // Check ETH and USDC balance before attempting deposit
        const ethBalance = await provider.getBalance(wallet.address);
        console.log(`ETH balance: ${ethBalance.toString()} wei (${(Number(ethBalance) / 1e18).toFixed(18)} ETH)`);
        if (ethBalance === 0n) {
            throw new Error('Insufficient ETH balance for gas fees');
        }

        // You can get testnet USDC on Eth-Sepolia from https://faucet.circle.com/
        const usdcBalance = await tokenContract.balanceOf(wallet.address);
        console.log(`USDC balance: ${usdcBalance.toString()} (${(Number(usdcBalance) / 1e6).toFixed(6)} USDC)`);
        if (usdcBalance < value) {
            throw new Error(`Insufficient USDC balance. Required: ${(Number(value) / 1e6).toFixed(6)} USDC, Available: ${(Number(usdcBalance) / 1e6).toFixed(6)} USDC`);
        }

        // Approve xReserve contract to spend tokens
        const approveTx = await tokenContract.approve(config.X_RESERVE_CONTRACT, value);
        console.log('Approval tx:', approveTx.hash);
        await approveTx.wait();

        // Send the depositToRemote transaction
        const tx = await xReserveContract.depositToRemote(
            value,
            config.CANTON_DOMAIN,
            remoteRecipientBytes32,
            config.ETH_USDC_CONTRACT,
            maxFee,
            hookData
        );

        console.log('Deposit tx:', tx.hash);
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Handle script errors
main().catch((error) => {
    console.error('💥 Script error:', error);
    process.exit(1);
});
