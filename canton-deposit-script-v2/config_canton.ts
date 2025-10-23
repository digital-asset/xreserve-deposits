// Canton-specific configuration values
export const config = {
    // RPC URL - defaults to testnet
    ETH_RPC_URL: 'https://ethereum-sepolia-rpc.publicnode.com', // MAINNET: "https://ethereum-rpc.publicnode.com"

    // Address that will send the transaction (publicly known)
    // This address is known upfront and can be exposed
    SIGNER_ADDRESS: '0xYOUR_ETHEREUM_ADDRESS_HERE', // The address that will sign transactions
    
    // Contract addresses (replace with actual deployed addresses)
    X_RESERVE_CONTRACT: '0x008888878f94C0d87defdf0B07f46B93C1934442', // Mainnet xReserve contract: 0x8888888199b2Df864bf678259607d6D5EBb4e3Ce
    ETH_USDC_CONTRACT: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Mainnet USDC contract: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
    CANTON_USDC: '0x74ed63088c070c8fd5d8ad71f2a1cef868c63d00e0ac6dc2a6722d171691a422', // Mainnet Canton USDC: '0x661237037dc811823d8b2de17aaabb8ef2ac9b713ca7db3b01fc7f7baf7db562'

    // Deposit parameters for Canton
    CANTON_DOMAIN: 10001, // Canton domain ID
    CANTON_RECIPIENT: 'YOUR_CANTON_RECIPIENT_PARTY_ID', // Canton recipient
    DEPOSIT_AMOUNT: '1.000001', // 1.000001 USDC, will be converted to wei
    MAX_FEE: '0' // 0 fee for Canton
};

// xReserve contract ABI - only the depositToRemote function
export const X_RESERVE_ABI = [
    'function depositToRemote(uint256 value, uint32 remoteDomain, bytes32 remoteRecipient, address localToken, uint256 maxFee, bytes calldata hookData) external'
];

// ERC20 contract ABI - only the approve and allowance functions
export const ERC20_ABI = [
    'function approve(address spender, uint256 amount) external returns (bool)',
    'function balanceOf(address account) external view returns (uint256)'
];
